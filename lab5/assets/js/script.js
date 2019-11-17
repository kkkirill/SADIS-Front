'use strict';

class Class {
    constructor() {
        this.classInfo = {
            letter: '',
            number: 0,
            amount: 0
        }
        this.teacherInfo = {
            lastName: '',
            firstName: '',
            phone: ''
        }
    }
}

class FormManager {
    nameMapping = {
        'inputClassLetter': ['classInfo', 'letter'],
        'inputClassNumber': ['classInfo', 'number'],
        'inputLearnersAmount': ['classInfo', 'amount'],
        'inputLastName': ['teacherInfo', 'lastName'],
        'inputFirstName': ['teacherInfo', 'firstName'],
        'inputPhone': ['teacherInfo', 'phone']
    }

    constructor() {
        this.state = new Class();
    }

    setState = (newState) => {
        if (!newState instanceof Class)
            return false;

        this.state = newState;

        Object.keys(this.nameMapping).forEach(e => $(`#${e}`).val(this.getStateProp(e)));
    }

    setStateProp = (targetId, value) => {
        this.nameMapping[targetId] &&
            this.nameMapping[targetId].reduce((acc, val, i, arr) => {
                if (!arr[i + 1])
                    acc[val] = value;
                return acc[val];
            }, this.state);
    }

    getStateProp = (targetId) => {
        if (!!this.nameMapping[targetId])
            return this.nameMapping[targetId].reduce((acc, val) => acc[val], this.state);
        else
            return '';
    }

    addOption = (value) => {
        $('#targetSelect').append(`<option value="${value}">${value}</option>`);
    }

    removeOption = (value) => {
        $(`#targetSelect option[value='${value}']`).remove();
    }

    handleInputFocusoutEvent = (event) => {
        this.setStateProp(event.target.id, event.target.value);
    }

    clear = () => {
        this.state = new Class();

        Object.keys(this.nameMapping).forEach(e => $(`#${e}`).val(''));
    }

    showModal = (title, data) => {
        $('#tableModal h4.modal-title').text(title);
        const tableBody = $('#tableModal .table-bordered tbody');
        tableBody.html('');
        [].forEach.call(data, (e, i) => {
            const tr = document.createElement('tr');
            const number = document.createElement('td');
            number.innerHTML = `<strong>${i + 1}</strong>`;
            number.className = 'table-active';
            tr.appendChild(number);
            [e.classLetter, e.classNumber, ...Object.values(e).slice(2)].forEach(value => {
                const td = document.createElement('td');
                td.innerText = value;
                tr.appendChild(td);
            })
            tableBody.append(tr);
        });
    }

    showErrors = (msgs) => {
        $('.alert').show();
        const target = $('.alert .errors-list');
        target.html('');
        msgs.forEach(e => {
            target.append(`<li>${e}</li>`);
        });
    }
}

class DbManager {
    classTableName = 'classes'

    constructor(dbName, size, dbVersion = '1.0', dbDescription = 'Class db') {
        this.dbName = dbName;
        this.size = size;
        this.db = openDatabase(dbName, dbVersion, dbDescription, size);

        if (!this.db)
            return alert('Cannot create db!');

        this.db.transaction(tx => {
            const query = `CREATE TABLE IF NOT EXISTS ${this.classTableName} (
                            classLetter TEXT NOT NULL, 
                            classNumber INTEGER NOT NULL, 
                            learnersAmount INTEGER NOT NULL,
                            lastName TEXT NOT NULL, 
                            firstName TEXT NOT NULL, 
                            phone TEXT NOT NULL)`;

            tx.executeSql(query, [],
                (tx, res) => console.info(`Table has been created`),
                (tx, err) => console.error('Table hasn\'t been created!\nError: ', err)
            );
        });
    }

    select = (isFiltered = false) => {
        const queryPattern = `SELECT 
                              classLetter, 
                              classNumber, 
                              ${isFiltered ? '{0}(learnersAmount)' : 'learnersAmount'}, 
                              lastName, 
                              firstName, 
                              phone 
                              FROM ${this.classTableName}`;
        const query = isFiltered ?
            `${queryPattern.replace('{0}', 'MAX')} UNION ${queryPattern.replace('{0}', 'MIN')}` :
            queryPattern;
        const defer = $.Deferred();

        this.db.transaction(tx => {
            tx.executeSql(query, [], (tx, res) => defer.resolve(res.rows));
        });

        return defer.promise();
    }

    add = (data, errHandler) => {
        if (!data instanceof Class)
            return;

        const values = [data.classInfo.letter, data.classInfo.number, data.classInfo.amount,
        data.teacherInfo.lastName, data.teacherInfo.firstName, data.teacherInfo.phone];
        const defer = $.Deferred();

        this.db.transaction(tx => {
            const query = `INSERT INTO ${this.classTableName} 
                           (classLetter, classNumber, learnersAmount, lastName, firstName, phone) 
                           VALUES (?, ?, ?, ?, ?, ?)`;

            tx.executeSql(query, values,
                (tx, res) => defer.resolve('Successful insertion', res),
                (tx, err) => defer.reject('Insertion error!', err)
            );
        });

        return defer.promise();
    }

    isExist = (id) => {
        if (!/^[A-Z]{1} \d{1,2}$/.test(id))
            return;

        const defer = $.Deferred();

        this.db.transaction(tx => {
            const query = `SELECT (classLetter || ' ' || classNumber) AS key 
                           FROM ${this.classTableName} 
                           WHERE key='${id}' 
                           LIMIT 1`

            tx.executeSql(query, [], (tx, res) => defer.resolve(res.rows.length));
        });

        return defer.promise();
    }

    remove = (id) => {
        if (!/^[A-Z]{1} \d{1,2}$/.test(id))
            return;

        const defer = $.Deferred();

        this.db.transaction(tx => {
            const query = `DELETE FROM ${this.classTableName} WHERE classLetter=? AND classNumber=?`;

            tx.executeSql(query, id.split(' '),
                (tx, res) => defer.resolve('Success removal', res),
                (tx, err) => defer.reject('Bad removal!', err)
            );
        });

        return defer.promise();
    }

}

$(document).ready(function () {
    const formManager = new FormManager();
    const dbManager = new DbManager('classesDB', 200000);

    if (!(formManager && dbManager))
        return;
    
    $.when(dbManager.select()).done(rows =>
        [].forEach.call(Object.values(rows),
            e => formManager.addOption(`${e.classLetter} ${e.classNumber}`))
    );
    $('#targetSelect').change(e => {
        $.when(dbManager.select())
        .done(rows => {
            const newState = new Class();
            const target = [].filter.call(rows, row => `${row.classLetter} ${row.classNumber}` === e.target.value)[0];
            newState.classInfo.letter = target.classLetter;
            newState.classInfo.number = target.classNumber;
            newState.classInfo.amount = target.learnersAmount;
            newState.teacherInfo.lastName = target.lastName;
            newState.teacherInfo.firstName = target.firstName;
            newState.teacherInfo.phone = target.phone;
            formManager.setState(newState);
        }
        );
    })
    $('.alert .close').click(e => $(e.target).parent().hide());
    $('#mainForm input').on('focusout', formManager.handleInputFocusoutEvent);
    $('#clearButton').click(formManager.clear);
    $('#mainForm').submit(e => {
        e.preventDefault();

        const id = formManager.state.classInfo.letter + ' ' + formManager.state.classInfo.number;

        $.when(dbManager.isExist(id))
            .done(
                count => {
                    console.log('Recieved count: ', count);
                    if (count) {
                        formManager.showErrors(['Class already exists!'])
                        return
                    }

                    dbManager.add(formManager.state, formManager.showErrors);
                    formManager.addOption(id);
                }
            );
    });

    $('#deleteButton').click(e => {
        const targetID = $('#targetSelect').val();
        if (!targetID)
            return;
        $.when(dbManager.remove(targetID))
            .done((msg, res) => {
                console.log(msg, res);
                formManager.removeOption(targetID);
                formManager.clear();
            })
            .fail((msg, err) => {
                formManager.showErrors([msg, err]);
            });
    });

    $('#showButton').click(e => {
        $.when(dbManager.select())
            .done(rows => {
                formManager.showModal('Classes', rows);
            }
            );
    });

    $('#filterButton').click(e => {
        $.when(dbManager.select(true))
            .done(rows => {
                rows.length && Object.values(rows.item(0))[0] &&
                    formManager.showModal('Max and Min classes', rows);
            }
            );
    });
});

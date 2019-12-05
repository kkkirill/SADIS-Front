'use strict';

class Order {

    constructor() {
        this._id = 0;
        this.name = '';
        this.cost = 0;
        this.amount = 0;
    }
}

class FormManager {
    nameMapping = {
        'orderId': ['_id'],
        'inputOrderName': ['name'],
        'inputOrderCost': ['cost'],
        'inputOrderAmount': ['amount'],
    }

    constructor() {
        this.state = new Order();
    }

    setState = (newState) => {
        if (!newState instanceof Order)
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

    handleInputFocusoutEvent = (event) => {
        this.setStateProp(event.target.id, event.target.value);
    }

    clear = () => {
        this.state = new Order();

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
            Object.values(e).slice(1).forEach(value => {
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


class RequestManger {
    static async get(fromFile=false) {
        return fetch(`/data${fromFile ? '?fromFile=true' : ''}`);
    }

    static async delete(minVal) {
        return await fetch('/data', {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ min: minVal })
        });
    }

    static async insert(data) {
        return await fetch('data', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }
}

$(document).ready(function () {
    const formManager = new FormManager();

    if (!formManager)
        return;

    $('.alert .close').click(e => $(e.target).parent().hide());
    $('#mainForm input').on('focusout', formManager.handleInputFocusoutEvent);
    $('#clearButton').click(formManager.clear);
    $('#mainForm').submit(e => {
        e.preventDefault();

        RequestManger
            .insert(formManager.state)
            .then(successResponse => console.log(successResponse))
            .catch(errResponse => console.error(errResponse));
    });

    $('#deleteButton').click(e => {
        let minCostVal = $('#delete-min-sum-input').val();
        RequestManger
            .delete(minCostVal)
            .then(successResponse => console.log(successResponse))
            .catch(errResponse => console.error(errResponse));
    });

    $('#showButton').click(async e => {
        const response = await RequestManger.get();
        const orders = await response.json();

        formManager.showModal('Orders', orders);
    });

    $('#fileShowButton').click(async e => {
        const response = await RequestManger.get(true);
        const orders = await response.json();

        formManager.showModal('Orders from file', orders);
    });
});

const countryJsonMapObj = {
    nameField: "name",
    singleValueFields: [
        ["Native name", "nativeName"],
        ["Numberic code", "numericCode"],
        ["Capital", "capital"],
        ["Region", "region"],
        ["Subregion", "subregion"],
        ["Population", "population"],
        ["Area", "area"],
    ],
    nValueFields: [
        ["Languages", "languages"],
        ["Alternative spellings", "altSpellings"],
        ["Timezones", "timezones"],
        ["Borders", "borders"]
    ],
    currencyField: ["Currencies", "currencies"],
    flagField: "flag"
}

function createTableRow(property, value) {
    const row = document.createElement('tr');
    const th = document.createElement('th');
    const td = document.createElement('td');

    th.innerHTML = property;
    td.innerHTML = value;
    row.appendChild(th);
    row.appendChild(td);
    return row;
}

function createFormatedCurrencyObjectRow(json) {
    const langObjs = json[countryJsonMapObj.currencyField[1]];
    const dl = document.createElement('dl');

    langObjs.forEach(langObj => {
        const dt = document.createElement('dt');
        const dd1 = document.createElement('dd');
        const dd2 = document.createElement('dd');
        
        dt.innerHTML = langObj.name;
        dd1.innerHTML = langObj.symbol;
        dd2.innerHTML = langObj.code;
        [dt, dd1, dd2].forEach(e => dl.appendChild(e));
    });
    return createTableRow(countryJsonMapObj.currencyField[0], dl.outerHTML);
}

function fillFields(json) {
    const target = document.querySelector('.content table tbody');

    target.innerHTML = '';
    $('#country-name').html(json[countryJsonMapObj.nameField]);
    countryJsonMapObj.singleValueFields.forEach(v =>
        target.appendChild(createTableRow(v[0], json[v[1]]))
    );
    target.appendChild(createFormatedCurrencyObjectRow(json));
    countryJsonMapObj.nValueFields.forEach(v =>
        target.appendChild(createTableRow(v[0], json[v[1]]))
    );
    $('.country-flag').attr('src', json[countryJsonMapObj.flagField]);
    $('.content').show();
}

function clearFields() {
    const target = document.querySelector('.content table tbody');

    target.innerHTML = '';
    $('#country-name').html('');
    $('.content').hide();
}

function errHandler(err) {
    alert('Cannot load country! Sorry!')
}

function fetchData() {
    $.ajax({
        type: 'GET',
        url: `data/${$('#data-option').val()}`,
        dataType: 'json',
        success: fillFields,
        error: errHandler
    });
}

window.addEventListener('load', () => {
    $('button#get-data-button').click(fetchData);
    $('button#clear-button').click(clearFields);
    $(document).click(function (e) {
        const collapsedContent = $('#collapse-content');

        if (!collapsedContent.has(e.target).length && collapsedContent.attr('class').includes('show')) {
            $('#collapseCloseButton').trigger('click');
        }
    });
});
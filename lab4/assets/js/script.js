window.onload = () => {
    const content = document.getElementsByClassName('content')[0];
    const fieldGroup = document.getElementsByClassName('field-group')[0];
    const buttons = content.querySelectorAll('.controls button');
    const styleDropDowns = content.getElementsByTagName('select');
    let inputs = fieldGroup.getElementsByTagName('input');
    
    const modal = document.getElementsByClassName('modal')[0];
    const modalContent = modal.getElementsByClassName('modal-content')[0];
    const closeButton = modalContent.getElementsByClassName('close')[0];

    const applyStyles = () => {
        [].forEach.call(inputs, e => {
            e.style.fontSize = styleDropDowns[0].value;
            e.style.color = styleDropDowns[1].value;
        });
    };

    const addField = () => {
        let input = document.createElement('input');
        input.placeholder = inputs[0].placeholder;
        fieldGroup.appendChild(input);
        applyStyles();
    };

    const showModal = () => {
        modal.style.display = 'block';
        modalContent.innerHTML = '';
        modalContent.appendChild(closeButton);
        let list = document.createElement('ol');
        [].forEach.call(inputs, (e, i) => {
            let li = document.createElement('li');
            li.value = i + 1;
            li.textContent = e.value || 'nothing';
            li.style.fontSize = e.style.fontSize;
            li.style.color = e.style.color;
            list.appendChild(li);
        });
        modalContent.appendChild(list);
    };

    const closeModal = () => modal.style.display = 'none';

    const resetFields = () => {
        [].forEach.call(inputs, e => {
            e.removeAttribute('style');
            e.value = '';
        });
        styleDropDowns[0].options[4].selected = true;
        styleDropDowns[1].options[0].selected = true;
    };

    const funcs = [resetFields, showModal, addField];

    closeButton.addEventListener('click', closeModal);
    buttons.forEach((e, i) => e.addEventListener('click', funcs[i]));
    [].forEach.call(styleDropDowns, e => e.addEventListener('change', applyStyles));
}

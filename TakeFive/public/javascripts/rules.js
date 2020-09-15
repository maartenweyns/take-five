M.AutoInit();

function penaltyPointsTakeRow(rownum) {
    let field = document.getElementById('amountOfPenaltyPoints');
    switch(rownum) {
        case 1:
            field.innerHTML = '6 penalty points!';
            break;
        case 2:
            field.innerHTML = '2 penalty points!';
            break;
        case 3:
            field.innerHTML = '1 penalty point!';
            break;
        case 4:
            field.innerHTML = '6 penalty points!';
            break;
    }
    document.getElementById('modal-penaltypoints-trigger').click();
}

function toggleDark() {
    let elems = document.getElementsByTagName('*')
    for (elem of elems) {
        if (elem.classList.contains('dark')) {
            elem.classList.remove('dark');
            continue;
        }
        elem.classList.add('dark');
    }
}
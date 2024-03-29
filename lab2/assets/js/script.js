const saveState = (main1, main2) => {
    localStorage.setItem("main1", getComputedStyle(main1, null).display);
    localStorage.setItem("main2", getComputedStyle(main2, null).display);
};

const setState = (main1, main2) => {
    main1.style.display = localStorage.getItem("main1") || 'flex';
    main2.style.display = localStorage.getItem("main2") || 'none';

    manageBorders(main1.style.display === 'flex');
};

const manageBorders = flag => {
    const functionName = flag ? 'add' : 'remove';

    document.body.classList[functionName]('window-border');
};

const swapPages = (pageToShow, pageToHide, isRemovingBorders) => {
    manageBorders(isRemovingBorders);

    pageToHide.style.display = 'none';
    pageToShow.style.display = 'flex';
};

window.onload = () => {
    const main1 = document.getElementsByClassName("main1")[0];
    const main2 = document.getElementsByClassName("main2")[0];
    const button1 = main1.getElementsByClassName("button")[0];
    const button2 = main2.getElementsByClassName("button")[0];

    setState(main1, main2);

    window.addEventListener('beforeunload', (event) => {
        saveState(main1, main2);
    });

    button1.addEventListener('click', (event) => {
        swapPages(main2, main1, false);
    });
    
    button2.addEventListener('click', (event) => {
        swapPages(main1, main2, true);
    });
};
    
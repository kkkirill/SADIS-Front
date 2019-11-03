class Planet {
    constructor(name, dist, distRefPointName, size, speed) {
        this.planetInfo = {
            'name': name,
            'dist': dist,
            'distRefPointName': distRefPointName,
            'size': size,
            'speed': speed
        }
        this.planetOribit = document.getElementById(this.planetInfo.name.toLowerCase());
        const planetOrbitStyle = getComputedStyle(this.planetOribit);
        this.planet = this.planetOribit.querySelector('.pos .planet');
        const planetStyle = getComputedStyle(this.planet);
        
        let planetOrbitDuration = parseFloat(planetOrbitStyle.animationDuration.slice(0, -1));
        this.dist = parseInt(planetOrbitStyle.width.slice(0, -2)); // in px
        let planetOrbitLength = 2*Math.PI*this.dist;
        
        this.speed = planetOrbitLength/planetOrbitDuration;  // in px/s
        this.size = parseInt(planetStyle.width.slice(0, -2));  //in px
        
        this.sizeRatio = this.size / this.planetInfo.size;  // px to km
        this.speedRatio = this.speed / this.planetInfo.speed;  // px/s to km/h
        this.distRatio = this.dist / this.planetInfo.dist;  // px to km
    }

    resetToDefault() {
        this.size = Math.round(this.planetInfo.size * this.sizeRatio);
        this.speed = Math.round(this.planetInfo.speed * this.speedRatio);
        this.dist = Math.round(this.planetInfo.dist * this.distRatio);
        this.planet.removeAttribute('style');
        this.planetOribit.removeAttribute('style');

        const animationName = this.planetOribit.firstElementChild.style.animationName;
        let child = this.planetOribit.firstElementChild;

        child.removeAttribute('style');
        child.style.animationName = animationName;
    }

    setDist(dist) {
        this.dist = Math.round(dist * this.distRatio);
        this.planetOribit.style.width = `${this.dist}px`;
        this.planetOribit.style.height = `${this.dist}px`;
        this.planetOribit.style.marginLeft = `${-this.dist/2}px`;
        this.planetOribit.style.marginTop = `${-this.dist/2}px`;
    }

    setSize(size) {
        this.size = Math.round(size * this.sizeRatio);
        this.planet.style.width = `${this.size}px`;
        this.planet.style.height = `${this.size}px`;
        this.planet.style.marginLeft = `${-this.size/2}px`;
        this.planet.style.marginTop = `${-this.size/2}px`;
    }

    setSpeed(speed) {
        let orbitLength = 2*Math.PI*this.dist;
        this.speed = Math.round(speed * this.speedRatio);
        this.planetOribit.style.animationDuration = `${Math.round(orbitLength/this.speed)}s` 
        this.planet.style.animationDuration = `${Math.round(orbitLength/this.speed)}s` 
        this.planet.parentElement.style.animationDuration = `${Math.round(orbitLength/this.speed)}s` 
    }
}

(function init() {

    const distances = {
        'mercury': 57_909_227,
        'venus': 108_209_475,
        'earth': 149_598_262,
        'mars': 227_943_824,
        'jupiter': 778_340_821,
        'saturn': 1_426_666_422,
        'uranus': 2_870_658_186,
        'neptune': 4_498_396_441
    }

    const sizes = {
        'mercury': 15_329,
        'venus': 38_024, 
        'earth': 40_030, 
        'mars': 21_296, 
        'jupiter': 439_263,
        'saturn': 365_882,
        'uranus': 159_354,
        'neptune': 154_704,
    }

    const speeds = {
        'mercury': 170_503,
        'venus': 126_074,
        'earth': 107_218,
        'mars': 86_677,
        'jupiter': 47_002,
        'saturn': 34_701,
        'uranus': 24_477,
        'neptune': 19_566
    }
    
    planets = {};

    for (val in speeds) {
        let name = val.charAt(0).toUpperCase() + val.slice(1);
        planets[val] = new Planet(name, distances[val], 'From Sun', sizes[val], speeds[val]);
    }

})()


function changeChildrenOpacity(parent, value) {
    [...parent.children].forEach(e => {
        e.style.opacity = value;
    });
}

function openNav(e) {
    const sidenav = document.getElementById('mySidenav');

    changeChildrenOpacity(sidenav, '1');
    sidenav.nextElementSibling.style.display = 'none';
    sidenav.style.width = '300px';
    sidenav.style.borderRightWidth = '2px';
}
  
function closeNav(e) {
    const sidenav = document.getElementById('mySidenav');
    
    changeChildrenOpacity(sidenav, '0');
    sidenav.style.width = '0';
    sidenav.style.overflow = 'hidden';
    sidenav.style.borderRightWidth = '0px';
    setTimeout(() => {
        sidenav.nextElementSibling.style.display = 'block';
        sidenav.style.overflow = '';
    }, 550);
}

function managePlanetsInfo(e, flag) {
    const infos = document.querySelectorAll('.infos');
    const displayValue = flag || e.target.checked ? 'block' : 'none';
    
    infos.forEach(e => {
        e.style.display = displayValue;
        e.style.marginTop = e.parentElement.className.includes('3d') ? '' : '0';
    });
}

function changeInfosValue (e) {
    const mapping = {
        'distance': ['From Sun', 'dist', 'km'],
        'size': ['Equatorial Circumference', 'size', 'km'],
        'speed': ['Orbit Velocity', 'speed', 'km/h'],
    }
    const comment = mapping[e.target.value][0];
    const planetField = mapping[e.target.value][1];
    const unit = mapping[e.target.value][2];

    const infos = document.querySelectorAll('dl.infos');
    const ids = [...infos].map(e => e.parentElement.parentElement.parentElement.id);
    const numberLabels = [...infos].map(e => e.querySelector('dd'));

    numberLabels.forEach((el, i) => {
        let value = planets[ids[i]]['planetInfo'][planetField];
        el.setAttribute('data-after', `${Intl.NumberFormat(useGrouping=true).format(value)} ${unit}`);
    });

    const comments = numberLabels.map(e => e.querySelector('span'));
    comments.forEach(el => el.setAttribute('data-after', comment));
}

function changeDimensionView(e) {
    const isChecked = e.target.checked;

    const solarSystem = document.querySelector('.solar-system');
    const sun = solarSystem.querySelector('#sun');
    const moonOrbit = solarSystem.querySelector('#earth .pos .orbit');
    const allPos = solarSystem.querySelectorAll('.pos');
    const allPlanet = solarSystem.querySelectorAll('.planet');
    const manageClassFuncName = isChecked ? 'add' : 'remove';
    let disp = solarSystem.style.display;
    solarSystem.style.display = 'none';
    let trick = solarSystem.offsetHeight;

    solarSystem.classList[manageClassFuncName]('solar-system-3d');
    sun.style.transform = isChecked ? 'rotateX(-90deg)' : '';

    allPos.forEach(e => {
        e.style.animationName = isChecked ? 'invert' : 'invert-2d';
    });

    allPlanet.forEach(e => {
        if (e.firstElementChild != null && e.firstElementChild.className === 'ring') {
            e.firstElementChild.style.transform = isChecked ? 'rotateX(-90deg)' : '';
        }
        e.classList[manageClassFuncName](`${e.parentElement.parentElement.id}-3d`);
        e.lastElementChild.style.transform = isChecked ? 'rotateZ(0deg)' : '';
    });

    moonOrbit.style.animationName = isChecked ? 'suborbit' : '';
    moonOrbit.firstElementChild.firstElementChild.classList[manageClassFuncName]('moon-3d');
    
    if (e.target.parentElement.parentElement.nextElementSibling.querySelector('input').checked)
        managePlanetsInfo(new Event('focus'), true);
    
        solarSystem.style.display = disp;
}

function setTarget(e) {
    const planetName = e.target.value;
    const speedControllerInput = document.querySelector('.sidenav .speed input');
    const sizeControllerInput = document.querySelector('.sidenav .size input');
    const distanceControllerInput = document.querySelector('.sidenav .distance input');
    
    if (planetName === 'none') {
        speedControllerInput.value = sizeControllerInput.value = distanceControllerInput.value = '';
        speedControllerInput.setAttribute('disabled', 'disabled');
        sizeControllerInput.setAttribute('disabled', 'disabled');
        distanceControllerInput.setAttribute('disabled', 'disabled');
    }
    else {
        speedControllerInput.removeAttribute('disabled');
        sizeControllerInput.removeAttribute('disabled');
        distanceControllerInput.removeAttribute('disabled');
        speedControllerInput.value = planets[planetName].planetInfo.speed;
        sizeControllerInput.value = planets[planetName].planetInfo.size;
        distanceControllerInput.value = planets[planetName].planetInfo.dist;
    }
}

function applyInputValues(e, isResetRequired=false) {
    const parent = e.target.parentElement;
    const targetPlanet = parent.parentElement.querySelector('.targets .target').value;
    
    if (targetPlanet === 'none') return;
    
    const distanceInput = parent.previousElementSibling.querySelector('input');
    const sizeInput = parent.previousElementSibling.previousElementSibling.querySelector('input');
    const speedInput = parent.previousElementSibling.previousElementSibling.previousElementSibling.querySelector('input');
    
    if (isResetRequired) {
        distanceInput.value = planets[targetPlanet].planetInfo.dist;
        sizeInput.value = planets[targetPlanet].planetInfo.size;
        speedInput.value = planets[targetPlanet].planetInfo.speed;
        planets[targetPlanet].resetToDefault();
        return;
    }

    planets[targetPlanet].setDist(parseInt(distanceInput.value));
    planets[targetPlanet].setSize(parseInt(sizeInput.value));
    planets[targetPlanet].setSpeed(parseInt(speedInput.value));
}

window.onload = () => {
    const openbtn = document.getElementsByClassName('openbtn')[0];
    const closebtn = document.getElementsByClassName('closebtn')[0];
    const sidenav = document.getElementById('mySidenav');
    const dimensionsToggleButton = sidenav.querySelector('.dimensions .switch input');
    const infoToggleButton = sidenav.querySelector('.info .switch input');
    const infoDropDown = sidenav.querySelector('.info-target');
    const targetDrowDown = sidenav.querySelector('.targets .target');
    const resetButton = sidenav.querySelector('.reset-button');
    const applyButton = sidenav.querySelector('.apply-button');

    dimensionsToggleButton.addEventListener('click', changeDimensionView);
    infoToggleButton.addEventListener('click', managePlanetsInfo);
    infoDropDown.addEventListener('change', changeInfosValue);
    targetDrowDown.addEventListener('change', setTarget);
    applyButton.addEventListener('click', applyInputValues);
    resetButton.addEventListener('click', e => applyInputValues(e, true));

    changeChildrenOpacity(sidenav, '0');
    infoDropDown.dispatchEvent(new Event('change'));

    openbtn.addEventListener('click', openNav);
    closebtn.addEventListener('click', closeNav);
}
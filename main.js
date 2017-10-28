function Setup() {
    left = document.getElementById("left");
    right = document.getElementById("right");

    ores = { list: [], totalweight: 0, weightslist: [] };
    upgrades = [];

    stoneCount = 0;
    stoneElement = document.getElementById("stone");
    minerElement = document.getElementById("miner");
    crusherElement = document.getElementById("crusher");
    smelterElement = document.getElementById("smelter");

    minerCount = 0;
    //minerEfficency = 1;
    minerSkill = 0;
    minerSpeed = 1;

    crusherCount = 0;
    crusherEfficency = 10;
    crusherSpeed = 1;

    smelterCount = 0;
    //smelterEfficency = 0.01;
    smelterSpeed = 1;

    AddOre("Coal", 30);
    AddOre("Iron",10);
    AddOre("Copper",20);
    AddOre("Tin",15);
    AddOre("Aluminium", 5);
    AddOre("Gold", 2);


    OnSliderChange();
    window.setInterval(OnTick, 100);
}

function AddOre(name,weight) {
    var ore = new Ore(name, weight);
    ores.totalweight += ore.weight;
    ores.list.push(ore);
    ores.weightslist.push(ores.totalweight);

    ore.elements = AddOreHTML(ores.list.length-1);
}

function Ore(name, weight) {
    this.name = name;
    this.amounts = [0, 0, 0];
    this.elements = null;
    this.weight = weight;
    this.changeAmount = function (ind, add)
    {
        this.elements[ind].innerText = Math.round(this.amounts[ind] += add);
    }
    this.mine = function(o) {
        this.changeAmount(0,o);
    }
    this.crush = function (i, os) {
        var random = Math.floor(Math.random() * os);
        i = i < this.amounts[0] ? i : this.amounts[0];
        this.changeAmount(0,-i);
        this.changeAmount(1, i * random);
        stoneElement.innerText = Math.round(stoneCount += ((100-random)/10)*i);
        return i;

    }
    this.smelt = function (i, os) {
        i = i < this.amounts[1] ? i : this.amounts[1];
        this.changeAmount(1,-i);
        this.changeAmount(2,i*os);
        return i;
    }
}

function AddOreHTML(id) {
    var bc = document.createElement("button");
    bc.setAttribute("onclick", `OnClickCrush(${id})`);
    bc.innerText = "Crush!";
    var bs = document.createElement("button");
    bs.setAttribute("onclick", `OnClickSmelt(${id})`);
    bs.innerText = "Smelt!";

    var p = document.createElement("p");
    p.innerText = ores.list[id].name + " Ore: ";
    var i = document.createElement("input");
    i.setAttribute("type", "range");
    i.setAttribute("min", "0");
    i.setAttribute("max", "100");
    i.setAttribute("oninput", `OnSliderChange(${id})`);
    p.appendChild(i);

    var p0 = document.createElement("p");

    var sm = document.createElement("span");
    sm.innerText = "Mined: ";
    var sma = document.createElement("span");
    sma.innerText = "0";
    sma.setAttribute("class", "tabbed");
    p0.appendChild(sm);
    p0.appendChild(sma);

    var sc = document.createElement("span");
    sc.innerText = "Crushed: ";
    var sca = document.createElement("span");
    sca.innerText = "0";
    sca.setAttribute("class", "tabbed");
    p0.appendChild(sc);
    p0.appendChild(sca);

    var ss = document.createElement("span");
    ss.innerText = "Smolten: ";
    var ssa = document.createElement("span");
    ssa.innerText = "0";
    ssa.setAttribute("class", "tabbed");
    p0.appendChild(ss);
    p0.appendChild(ssa);


    var arr = [];

    left.appendChild(p);
    left.appendChild(p0);

    arr.push(sma);
    arr.push(sca);
    arr.push(ssa);
    arr.push(i);

    left.appendChild(bc);
    left.appendChild(bs);
    return arr;

    //left.innerHTML += (`<label id="${itemName}_label">${item}:<span id="${itemName}_number"></span></label>`);
}

function OnSliderChange() {
    slidertotal = 0;
    for (var i = 0; i < ores.list.length; i++) {
        slidertotal+= parseInt(ores.list[i].elements[3].value);
    }
}

function GetRandomOre() {
    var random = Math.floor(Math.random() * ores.totalweight);
    for (var i = 0; i < ores.weightslist.length; i++) { //too lazy for binary search
        if (random < ores.weightslist[i]) {
            return ores.list[i];
        }
    }
    return null;
}

function OnClickMine() {
    GetRandomOre().mine(1);
}

function OnClickCrush(id) {
    ores.list[id].crush(1, 10);
}

function OnClickSmelt(id) {
    ores.list[id].smelt(100,1/100);
}

function OnTick() {
    for (var i = 0; i < minerCount; i++) {
        GetRandomOre().mine(1/10);
    }

    var localslidertotal = slidertotal;
    for (var j = 0; j < ores.list.length; j++) {
        var ore = ores.list[j];


        //DOESN'T WORK
        //TODO: when one thing is empty, the other have to use all the available "power"
        var sliderfraction = parseInt(ore.elements[3].value) / localslidertotal;
        var c = (crusherCount * crusherSpeed * sliderfraction) / 10;
        if (c > 0) {
            localslidertotal -= (ore.crush(c, crusherEfficency) / c) * sliderfraction;
        }

        sliderfraction = parseInt(ore.elements[3].value) / localslidertotal;
        var s = (smelterCount * smelterSpeed * sliderfraction) / 10;
        if (s > 0) {
            localslidertotal -= (ore.smelt(s, 100) / s) * sliderfraction;
        }

    }

}

function GenerateUpgrade(level) {
    var upgrade = new Upgrade();
    var value = 0;
    for (var i = 0; i < ores.list.length; i++) {
        var random = Math.floor(Math.random() * level);
        upgrade.costs.push(random);
        value += 100/ores.list[i].weight;
    }
    for (var j = 0; j < upgrade.effects.length; j++) {
        
    }
}

function BuyMiner() {
    if (ores.list[1].amounts[2] >= 1 && ores.list[2].amounts[2] >= 1 && ores.list[3].amounts[2] >= 1) {
        ores.list[1].changeAmount(2, -1);
        ores.list[2].changeAmount(2, -1);
        ores.list[3].changeAmount(2, -1);
        minerElement.innerText = ++minerCount;
    }
}

function BuyCrusher() {
    if (ores.list[1].amounts[2] >= 2 && ores.list[2].amounts[2] >= 1) {
        ores.list[1].changeAmount(2, -2);
        ores.list[2].changeAmount(2, -1);
        crusherElement.innerText = ++crusherCount;
    }
}

function BuySmelter() {
    if (ores.list[1].amounts[2] >= 1 && ores.list[3].amounts[2] >= 1 && ores.list[4].amounts[2] >= 1) {
        ores.list[1].changeAmount(2, -1);
        ores.list[3].changeAmount(2, -1);
        ores.list[4].changeAmount(2, -1);
        crusherElement.innerText = ++crusherCount;
    }
}

function Upgrade() {
    this.costs = [];
    this.effects = [0,0,0,0,0];
}
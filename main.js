function Setup() {
    tps = 10;

    vowels = ["a", "e", "i", "o", "u", "y"];
    consonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "qu", "r", "s", "t", "v", "w", "x", "z"];

    left = document.getElementById("left");
    right = document.getElementById("right");

    cauldronfluid = document.getElementById("fluid");
    makeingotbutton = document.getElementById("makeingotbutton");

    stoneElement = document.getElementById("stone");
    minerElement = document.getElementById("miner");
    crusherElement = document.getElementById("crusher");
    smelterElement = document.getElementById("smelter");

    smeltingpotsizeElement = document.getElementById("smeltingpotsize");
    smeltingpotsizenumber = document.getElementById("smeltingpotsizenumber");

    smeltingpotsize = 1;

    ores = { list: [], totalweight: 0, weightslist: [] };
    ingots = [];


    cauldroncontent = [];
    cauldroncontent.color = [0, 0, 0];

    upgrades = [];

    stoneCount = 0;

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



    nuggetimg = new Image();
    nuggetimg.src = "nugget.png";
    nuggetimg.onload = function () {
        if (document.cookie) {
            var cookie = JSON.parse(document.cookie);
            for (var i = 0; i < cookie[0].list.length; i++) {
                var e = cookie[0].list[i];
                var ore = AddOre(e.name, e.symbol, e.weight, e.color);
                ore.amounts = e.amounts;
                ore.changeAmount(0, 0, 0);
                ore.changeAmount(1, 0, 0);
                ore.changeAmount(2, 0, 2);
            }
            for (var j = 0; j < cookie[1].length; j++) {
                var e = cookie[1][j];
                var ingot = AddIngot(e.name,e.color);
                ingot.amount = e.amount;
                ingot.changeAmount(0, 0);
                ingot.recipe = e.recipe;
            }
        } else {
            //initores();
            initrandomores(6);
        }
    }

    ingotimg = new Image();
    ingotimg.src = "ingot.png";


    fluidimg = new Image();
    fluidimg.src = "fluidincauldron.png";
    fluidimg.onload = function () {
        initfluid();
    }
    


    window.setInterval(OnTick, 1000/tps);
}

function initores() {
    AddOre("Carbon", "C", 30, [45, 45, 44]);
    AddOre("Iron", "Fe", 10, [142, 132, 115]);
    AddOre("Copper", "Cu", 20, [142, 70, 22]);
    AddOre("Tin", "Sn", 15, [168, 168, 168]);
    AddOre("Aluminium", "Al",5, [216, 216, 210]);
    AddOre("Gold", "Au", 2, [160, 160, 54]);
}

function initrandomores(count) {
    for (var i = 0; i < count; i++) {
        var name = RandomName();
        var symbol = name.charAt(0).toUpperCase() + name.charAt(1);
        for (var j = 0; j < ores.list.length; j++) {
            if (ores.list[j].symbol == symbol) {
                i--;
                continue;
            }
        }
        AddOre(name, symbol, Math.floor(Math.random() * 100), [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)])
    }
}



function initfluid() {
    var ctx = cauldronfluid.getContext("2d");
    ctx.drawImage(fluidimg, 0, 0);
    fluidcolordata = ctx.getImageData(0, 0, cauldronfluid.width, cauldronfluid.height);
}

function AddOre(name,symbol,weight,color) {
    var ore = new Ore(name, symbol, weight, color);
    ores.totalweight += ore.weight;
    ores.list.push(ore);
    ores.weightslist.push(ores.totalweight);

    ore.id = ores.list.length - 1;
    ore.elements = AddOreHTML(ores.list.length - 1);

    return ore;
}

function Ore(name, symbol, weight, color) {
    this.id = 0;
    this.name = name;
    this.symbol = symbol;
    this.amounts = [0, 0, 0];
    this.elements = null;
    this.weight = weight;
    this.color = color;
    this.changeAmount = function(ind, add, dec) {
        this.elements[ind].innerText = (this.amounts[ind] += add).toFixed(dec);
    };
    this.mine = function(o) {
        this.changeAmount(0, o, 0);
    };
    this.crush = function(i, os) {
        var random = Math.floor(Math.random() * os);
        i = i < this.amounts[0] ? i : this.amounts[0];
        this.changeAmount(0, -i, 0);
        this.changeAmount(1, i * random, 0);
        stoneElement.innerText = Math.floor(stoneCount += ((100 - random) / 10) * i);
        return i;

    };
    this.smelt = function(i, os) {
        i = i < this.amounts[1] ? i : this.amounts[1];
        this.changeAmount(1, -i, 0);
        this.changeAmount(2, i * os, 2);
        return i;
    };
    this.pay = function (amount) {
        if (this.amounts[2] >= amount) {
            this.changeAmount(2,-amount,2);
            return true;
        }
        return false;
    }
}

function Ingot(materials, color) {
    this.recipe = [];

    for (var i = 0; i < materials.length; i++) {
        var material = materials[i];
        if (material == null) continue;
        if (material instanceof Ore) {
            var x = this.recipe[material.id];
            if (x == undefined) {
                this.recipe[material.id] = 1;
            } else {
                this.recipe[material.id]++;
            }
        } else {
            for (var id in material.recipe) {
                var x = this.recipe[id];
                if (x == undefined) {
                    this.recipe[id] = material.recipe[id];
                } else {
                    this.recipe[id]+= material.recipe[id];
                }
            }
        }
    }
    var amountsarray = [];
    for (var item in this.recipe) {
        amountsarray.push(this.recipe[item]);
    }
    var GCD = GetGCD(amountsarray);
    for (var item in this.recipe) {
        this.recipe[item] /= GCD;
    }

    this.amount = 0;
    this.changeAmount = function(add, dec) {
        this.elements[0].innerText = (this.amount += add).toFixed(dec);
    };
    var symbols = [];
    for (var key in this.recipe) {
        var s = ores.list[key].symbol;
        var x = this.recipe[key];
        if (x > 1) s += x;
        symbols.push(s);
    }
    symbols.sort(function (a, b) {
        if (a < b) return -1;
        else if (a > b) return 1;
        return 0;
    });
    this.name = symbols.join("");
    this.color = color;
    this.elements = [];
    this.pay = function(amount) {
        if (this.amount >= amount) {
            this.changeAmount(-amount, 0);
            return true;
        }
        return false;
    }
}

function GetGCD(o) {
    if (!o.length)
        return 0;
    for (var r, a, i = o.length - 1, b = o[i]; i;)
        for (a = o[--i]; r = a % b; a = b, b = r);
    return b;
};

function AddOreHTML(id) {
    var ore = ores.list[id];

    var bc = document.createElement("button");
    bc.setAttribute("onclick", `OnClickCrush(${id})`);
    bc.innerText = "Crush!";
    var bs = document.createElement("button");
    bs.setAttribute("onclick", `OnClickSmelt(${id})`);
    bs.innerText = "Smelt!";

    var i = CreateColoredNugget(ore.color);
    i.setAttribute("draggable", "true");
    i.setAttribute("ondragstart", `ondragore(event,${id})`);
    var p = document.createElement("p");
    p.innerText = ore.name + " Ore: ";
    p.prepend(i);

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
    ssa.innerText = "0.00";
    ssa.setAttribute("class", "tabbed");
    p0.appendChild(ss);
    p0.appendChild(ssa);


    var arr = [];

    left.appendChild(p);
    left.appendChild(p0);

    arr.push(sma);
    arr.push(sca);
    arr.push(ssa);

    left.appendChild(bc);
    left.appendChild(bs);
    return arr;
}

function AddIngotHTML(id) {
    var ingot = ingots[id];

    var d = document.createElement("div");

    var bt = document.createElement("button");
    bt.setAttribute("onclick", `OnTrash(${id})`);
    bt.innerText = "X";
    bt.style.position = "absolute";
    bt.style.top = "0px";
    bt.style.left = "60px";

    var bc = document.createElement("button");
    bc.setAttribute("onclick", `OnClickSell(${id})`);
    bc.innerText = "Sell!";

    var i = CreateColoredIngot(ingot.color);
    i.setAttribute("draggable", "true");
    i.setAttribute("ondragstart", `ondragingot(event,${id})`);
    var p = document.createElement("p");
    p.innerHTML = ingot.name.replace(/(\d+)/g,"<sub>$1</sub>") + " Ingot: ";
    p.style.position = "relative";
    p.prepend(i);
    p.prepend(bt);

    var p0 = document.createElement("p");

    var ss = document.createElement("span");
    ss.innerText = "Stored: ";
    var ssa = document.createElement("span");
    ssa.innerText = "0";
    ssa.setAttribute("class", "tabbed");

    p0.appendChild(ss);
    p0.appendChild(ssa);

    d.appendChild(p);
    d.appendChild(p0);

    d.appendChild(bc);

    right.appendChild(d);
    return [ssa,d];
}

function CreateColoredNugget(color) {
    var c = document.createElement("canvas");
    var ctx = c.getContext("2d");
    c.width = 30;
    c.height = 40;
    ctx.drawImage(nuggetimg, 0, 0, 30, 40);
    var data = ctx.getImageData(0, 0, c.width, c.height);

    for (var i = 0, length = data.data.length; i < length; i += 4) {
        data.data[i] = Math.min(255, ((data.data[i] / 255)) * color[0]);
        data.data[i + 1] = Math.min(255, ((data.data[i + 1] / 255)) * color[1]);
        data.data[i + 2] = Math.min(255, ((data.data[i + 2] / 255)) * color[2]);
    }

    ctx.putImageData(data, 0, 0);

    //c.width /= 2;
    //c.height /= 2;
    return c;
}

function CreateColoredIngot(color) {
    var c = document.createElement("canvas");
    var ctx = c.getContext("2d");
    c.width = 53;
    c.height = 40;
    ctx.drawImage(ingotimg, 0, 0, 53, 40);
    var data = ctx.getImageData(0, 0, c.width, c.height);

    for (var i = 0, length = data.data.length; i < length; i += 4) {
        data.data[i] = Math.min(255, ((data.data[i] / 255)) * color[0]);
        data.data[i + 1] = Math.min(255, ((data.data[i + 1] / 255)) * color[1]);
        data.data[i + 2] = Math.min(255, ((data.data[i + 2] / 255)) * color[2]);
    }

    ctx.putImageData(data, 0, 0);

    //c.width /= 2;
    //c.height /= 2;
    return c;
}

function ondragore(event, id) {
    event.dataTransfer.setData("ore", id);
}

function ondragingot(event, id) {
    event.dataTransfer.setData("ingot", id);
}

function addtocauldron(event) {
    var type = "o";
    var id = event.dataTransfer.getData("ore");
    if (id == "") {
        type = "i";
        id = event.dataTransfer.getData("ingot");
    } 

    if (id != "") {

        var current = parseInt(cauldronfluid.style.top);
        if (current == 50) smeltingpotsize = smeltingpotsizeElement.value;

        var toadd = Math.floor(50 / smeltingpotsize);
        if (current >= toadd ) { 

            if (type == "o") {
                if (!ores.list[id].pay(1)) return;
                cauldroncontent.push(ores.list[id]);
            } else if (type == "i") {
                if (!ingots[id].pay(1)) return;
                cauldroncontent.push(ingots[id]);
            }




            cauldronfluid.style.top = current - toadd + "px";


            var ctx = cauldronfluid.getContext("2d");
            var data = ctx.getImageData(0, 0, cauldronfluid.width, cauldronfluid.height);

            cauldroncontent.color = [0, 0, 0];

            for (var j = 0; j < cauldroncontent.length; j++) {
                cauldroncontent.color[0] += cauldroncontent[j].color[0];
                cauldroncontent.color[1] += cauldroncontent[j].color[1];
                cauldroncontent.color[2] += cauldroncontent[j].color[2];
            }
            cauldroncontent.color[0] /= cauldroncontent.length;
            cauldroncontent.color[1] /= cauldroncontent.length;
            cauldroncontent.color[2] /= cauldroncontent.length;

            for (var i = 0, length = data.data.length; i < length; i += 4) {
                data.data[i] = Math.min(255, ((fluidcolordata.data[i] / 255)) * cauldroncontent.color[0]);
                data.data[i + 1] = Math.min(255, ((fluidcolordata.data[i + 1] / 255)) * cauldroncontent.color[1]);
                data.data[i + 2] = Math.min(255, ((fluidcolordata.data[i + 2] / 255)) * cauldroncontent.color[2]);
            }

            ctx.putImageData(data, 0, 0);

            if (current - 2*toadd <= 0) {
                makeingotbutton.disabled = false;
            }
        }

    }
}

function AddIngot(name,color) {
    var ingot = new Ingot([], color);
    ingot.name = name;
    ingots.push(ingot);
    ingot.id = ingots.length - 1;
    ingot.elements = AddIngotHTML(ingots.length - 1);

    return ingot;
}

function makeingot() {
    var ingot = new Ingot(cauldroncontent, cauldroncontent.color);
    for (var i = 0; i < ingots.length; i++) {
        if (ingots[i].name == ingot.name) {
            ingots[i].changeAmount(parseInt(smeltingpotsize), 0);
            cauldroncontent = [];
            cauldroncontent.color = [0, 0, 0];
            cauldronfluid.style.top = 50 + "px";
            makeingotbutton.disabled = true;
            ingots[i].elements[1].style.display = "block";
            return;
        }
    }

    ingots.push(ingot);
    ingot.id = ingots.length - 1;
    ingot.elements = AddIngotHTML(ingots.length - 1);
    ingot.changeAmount(parseInt(smeltingpotsize), 0);


    cauldroncontent = [];
    cauldroncontent.color = [0, 0, 0];
    cauldronfluid.style.top = 50 + "px";
    makeingotbutton.disabled = true;
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

function OnClickSell(id) {
    
}

function OnTrash(id) {
    ingots[id].elements[1].style.display = "none";
}

function OnTick() {
    for (var i = 0; i < minerCount; i++) {
        GetRandomOre().mine(1/10);
    }

    for (var j = 0; j < ores.list.length; j++) {
        var ore = ores.list[j];

        ore.crush((crusherCount * crusherSpeed) / tps, crusherEfficency);

        ore.smelt((smelterCount * smelterSpeed) /tps, 100);

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

function OnExit() {
    if(!reset)
    document.cookie = JSON.stringify([ores,ingots]);
}

var reset = false;
function Reset() {
    reset = true;
    document.cookie = "";
    location.reload();
}


    function RandomName()
    {
        var name = "";
        lastwasvowel = false;

        if (Math.random() > 0.666666666666)
        {
            name += consonant();
            lastwasvowel = false;
        }
        else
        {
            name += vowel();
            lastwasvowel = true;
        }

        if (lastwasvowel) {
            name += consonant();
            lastwasvowel = false;
        }
        else {
            name += vowel();
            lastwasvowel = true;
        }

        if (lastwasvowel) {
            name += consonant();
            lastwasvowel = false;
        }
        else {
            name += vowel();
            lastwasvowel = true;
        }

        while (Math.random() > 0.3) {
            if (lastwasvowel) {
                name += consonant();
                lastwasvowel = false;
            }
            else {
                name += vowel();
                lastwasvowel = true;
            }
    }

        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    function vowel()
    {
        var v = "";

        v += vowels[Math.floor(Math.random() * vowels.length)];

        if (Math.random() > 0.8) {
            v += vowels[Math.floor(Math.random() * vowels.length)];
        }

        return v;
    }

    function consonant()
    {
        var c = "";

        c += consonants[Math.floor(Math.random() * consonants.length)];

        if (Math.random() > 0.5) {
            c += consonants[Math.floor(Math.random() * consonants.length)];
        }

        return c;
    }
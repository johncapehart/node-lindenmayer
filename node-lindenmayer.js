/**
 * Created by john.capehart on 7/31/2016.
 */
/** based on blob post at: https://cartesianfaith.com/2014/01/18/generating-artificial-plants-using-stochastic-lindenmayer-systems-with-d3-js/
 */

var arbitrage = require('./node-arbitrage.js')
function dol_step(init, rules) {
    var iterate = function(acc, x) {
        var p = rules[x]
        if (p == undefined) { p = x }
        p.split('').map(function(a) { acc.push(a) })
        return acc
    }
    return init.reduce(iterate, [])
}

this.lsystem = function(n, init, rules, step_fn) {
    if (typeof step_fn === 'undefined') step_fn = dol_step
    return arbitrage.seq(1,n).reduce(function(acc) { return step_fn(acc, rules) }, init)
}

this.plant = function(length, theta) {
    if (typeof theta === 'undefined') theta = -25 * Math.PI / 180
    return function(acc, code) {
        switch (code) {
            case 'X': break
            case 'F':
                acc.state.x -= Math.round(length * Math.cos(acc.state.theta));
                acc.state.y -= Math.round(length * Math.sin(acc.state.theta));
                acc.svg.push("L " + acc.state.x + " " + acc.state.y)
                break

            case '+':
                acc.state.theta += theta
                break

            case '-':
                acc.state.theta -= theta
                break

            case '[':
                acc.stack.push($.extend({}, acc.state));
                break

            case ']':
                acc.state = acc.stack.pop()
                acc.svg.push("M " + acc.state.x + " " + acc.state.y)
                break
        }
        return acc
    }
}

function sol_step(init, rules) {
    var get_production = function(x) {
        var rule = rules[x]
        if (rule == undefined) { return x }
        if (rule instanceof Array) {
            var vs = rule
            var ps = cumsum(rep(1/rule.length, rule.length))
        } else {
            var vs = Object.keys(rule)
            var ps = cumsum(vs.map(function(v) { return rule[v] }))
        }
        return sample(vs, 1, ps)[0]
    }
    var iterate = function(acc, x) {
        var p = get_production(x)
        p.split('').map(function(a) { acc.push(a) })
        return acc
    }
    return init.reduce(iterate, [])
}

function linit(x,y) {
    var state = { x:x, y:y, theta:Math.PI/2 }
    var svg = [ "M " + x + " " + y ]
    return { state:state, svg:svg, stack:[] , xml:null}
}

this.ldraw = function(state, target) {
    if (typeof target === 'undefined') target = "#svg"
    var t = d3.select(".chart")
        .append("svg")
        .attr("version", "1.1")
        .attr("width", 800)
        .attr("height", 800)
        .append("path")
        .attr("stroke","black")
        .attr("stroke-width",3)
        .attr("fill","none")
        .attr("d", state.svg.join(" "));
   /* var html = d3.select("svg")
        .attr("id", "#lsystem")
        .attr("title", "test2")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().outerHTML;*/
    var svg = document.querySelector('svg');
    var config = {
        filename: '/temp/svg2.svg',
    }
    var xmls = require('XMLSerializer') ;
    var source = xmls.serializeToString(svg);
    state.xml = source;
    return state;
}

this.lrender = function (origin, sequence, handler) {
    var state = linit(origin.x, origin.y)
    state = sequence.reduce(handler, state)
    this.ldraw(state, "#svg")
    return state
}

/***********************************************************************************************//**
 *  Unit testing system's model functionalities.
 *  @file       unit.js
 *  @author     Anton Villalonga, antonuxx@gmail.com
 *  @date       2020-nov-20
 *  @copyright  This file is part of a project developed at Nano-Satellite and Payload Laboratory
 *              (NanoSat Lab), Universitat Politècnica de Catalunya - UPC BarcelonaTech.
 **************************************************************************************************/

const path = require('path');
const fs = require("fs");
var assert = require('assert');
var chai = require("chai");
var expect = chai.expect;

/***********************************************************************************************//**
 *  @See https://github.com/jsdom/jsdom
 **************************************************************************************************/
var m_html = fs.readFileSync(__dirname + "/../../src/index.html", "utf8");
const { JSDOM } = require("jsdom");
const dom = new JSDOM(m_html);
global.window = dom.window;
global.document = dom.window.document;

let jQuery = require("jquery");
global.jQuery = jQuery;
global.$ = jQuery;

var physical_components = JSON.parse(fs.readFileSync(__dirname + "/../../src/jsonFiles/physical_components.json", "utf8")).components;
var components = JSON.parse(fs.readFileSync(__dirname + "/test_components.json", "utf8")).configured_components;
var satellites_model = JSON.parse(fs.readFileSync(__dirname + "/test_satellite.json", "utf8"));
var systems_model = JSON.parse(fs.readFileSync(__dirname + "/../../src/jsonFiles/system/system_model.json")).systems;

global.physical_components = physical_components;
global.components = components;
global.satellites_model = satellites_model;
global.systems_model = systems_model;

var system_js = require(__dirname + "/../../src/js/system/system.js");

/***********************************************************************************************//**
 *  @See https://www.chaijs.com/
 *  @See https://mochajs.org/
 **************************************************************************************************/
describe("Unit testing systems", function()
{
    it("modelsys_add_single_system", function()
    {
        var sat_type = satellites_model[0].id;
        var orbit_id = "test_orbit_id";
        var ecc = 0.5;
        var sma = 100;
        var incl = 90;
        var raan = 120;
        var argp = 80;
        var ma = 160;

        system_js.modelsys_add_single_system(sat_type, orbit_id, ecc, sma, incl, raan, argp, ma);
        expect(systems_model.length, "failed on adding system").to.equal(1);
        expect(systems_model[0].id, "incorrect system id").to.equal("test_orbit_id");
        expect(Object.keys(systems_model[0].space)[0]).to.equal("a_0");
    });

    it("modelsys_rename_system", function()
    {
        var system = systems_model[0];
        var new_id = "system_new_id";

        system_js.modelsys_rename_system(system, new_id);
        expect(systems_model[0].id, "incorrect system id").to.equal(new_id);
    });

    it("modelsys_add_satellite", function()
    {
        var sat_type = satellites_model[0].id;
        var orbit_id = "system_new_id";
        var ecc = 0.7;
        var sma = 107;
        var incl = 97;
        var raan = 127;
        var argp = 87;
        var ma = 167;

        system_js.modelsys_add_satellite(sat_type, orbit_id, ecc, sma, incl, raan, argp, ma);
        expect(Object.keys(systems_model[0].space).length, "space object length is incorrect").to.equal(2);
        expect(Object.keys(systems_model[0].space)[1]).to.equal("a_1");
    });

    it("modelsys_delete_satellite", function()
    {
        var system_id = "system_new_id";
        var sat_id = "a_1";

        system_js.modelsys_delete_satellite(system_id, sat_id);
        expect(Object.keys(systems_model[0].space).length, "space object length is incorrect").to.equal(1);
        expect(Object.keys(systems_model[0].space)[0], "deleted the incorrect sat").to.equal("a_0");
    });

    it("modelsys_save_systems", function()
    {
        var system = systems_model[0];

        let returned_sys = system_js.modelsys_save_systems(system);
        expect(Object.keys(returned_sys.space).length, "space object length is incorrect").to.equal(1);
        expect(Object.keys(systems_model[0].space)[0], "saved the incorrect sat").to.equal("a_0");
    });

    it("modelsys_delete_system", function()
    {
        var system_id = "system_new_id";

        system_js.modelsys_delete_system(system_id);
        expect(systems_model.length, "Object is not empty and should be").to.equal(0);
    });
});

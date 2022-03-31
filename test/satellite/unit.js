/***********************************************************************************************//**
 *  Unit testing satellite's model functionalities.
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
var components = JSON.parse(fs.readFileSync(__dirname + "/../../src/jsonFiles/configured_components.json", "utf8")).configured_components;
var satellites_model = JSON.parse(fs.readFileSync(__dirname + "/../../src/jsonFiles/satellite/configured_satellites.json", "utf8"))
.configured_satellites;
global.physical_components = physical_components;
global.components = components;
global.satellites_model = satellites_model;

var components_js = require(__dirname + "/../../src/js/components/components.js");
var satellite_js = require(__dirname + "/../../src/js/satellite/satellite_content.js");

/***********************************************************************************************//**
 *  @See https://www.chaijs.com/
 *  @See https://mochajs.org/
 **************************************************************************************************/
describe("Testing modelsat functions", function()
{
    it("model_create_components", function()
    {
        var comp_id1 = "comp_test";
        var comp_type1 = "Battery";
        var param_name = "channels";
        var param_value = "1";
        var this_ref = $(this);

        components_js.model_add_component(comp_type1, comp_id1);
        components_js.model_add_parameter(comp_id1, param_name, param_value, this_ref);
        assert.equal(comp_type1, components[0].type);
        assert.equal(comp_id1, components[0].id);
        expect(components.length, "Component hasn't been added").to.equal(1);
        expect(components[0].variables.out[0].name).to.equal("output_power0");

        var comp_id2 = "comp_test2";
        var comp_type2 = "Battery";

        components_js.model_add_component(comp_type2, comp_id2);
        assert.equal(comp_type2, components[1].type);
        assert.equal(comp_id2, components[1].id);
        expect(components.length, "Component hasn't been added").to.equal(2);
    });

    it("modelsat_add_satellite", function()
    {
        var sat_id = "sat_id_test";

        satellite_js.modelsat_add_satellite(sat_id);
        expect(satellites_model[0].id).to.equal(sat_id);
    });

    it("modelsat_add_component", function()
    {
        var sat_id = "sat_id_test";
        var component_title = components[0].type + "::" + components[0].id;

        satellite_js.modelsat_add_component(sat_id, component_title);

        let comp_id = component_title.split("::").pop();
        let comp_type = comp_id.substr(0, comp_id.lastIndexOf("_"));
        expect(satellites_model[0].models[0].id).to.equal(comp_id);
        expect(satellites_model[0].models[0].type).to.equal(comp_type);
        expect(satellites_model[0].models.length).to.equal(1);
    });

    it("modelsat_add_component", function()
    {
        var sat_id = "sat_id_test";
        var component_title = components[1].type + "::" + components[1].id;

        satellite_js.modelsat_add_component(sat_id, component_title);

        let comp_id = component_title.split("::").pop();
        let comp_type = comp_id.substr(0, comp_id.lastIndexOf("_"));
        expect(satellites_model[0].models[1].id).to.equal(comp_id);
        expect(satellites_model[0].models[1].type).to.equal(comp_type);
        expect(satellites_model[0].models.length).to.equal(2);
    });

    it("should create and delete links", function()
    {
        var satellite = satellites_model[0];

        var link =
        {
            out: "comp_test.output_power0",
            in: "comp_test2.input_fixed"
        };

        satellite.links.push(link);
        satellite_js.modelsat_delete_links(satellite);
        expect(satellites_model[0].links.length, "link hasn't deleted").to.equal(0);
    });

    it("modelsat_save_models", function()
    {
        var satellite = satellites_model[0];
        var graph = require(__dirname + "/test_config.json");

        satellite.graph = graph.graph;

        satellite_js.modelsat_save_models(satellite);
        expect(satellite.models.length, "missing models").to.equal(2);
        expect(satellite.models[0].type, "incorrect type").to.equal("da");
        expect(satellite.models[0].id, "incorrect id").to.equal("da_0");
        expect(satellite.models[1].type, "incorrect type").to.equal("da1");
        expect(satellite.models[1].id, "incorrect id").to.equal("da1_0");
    });

    it("modelsat_delete_models", function()
    {
        var satellite = satellites_model[0];

        satellite_js.modelsat_delete_models(satellite);
        expect(satellites_model[0].models.length, "sat's models object is not empty").to.equal(0);
    });

    it("modelsat_delete_satellite", function()
    {
        var sat_id = "sat_id_test";

        satellite_js.modelsat_delete_satellite(sat_id);
        expect(satellites_model.length, "length of satellites_model object is not 0").to.equal(0);
    });
});

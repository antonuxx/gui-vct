/***********************************************************************************************//**
 *  Unit testing component's model functionalities.
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
global.physical_components = physical_components;
global.components = components;

var components_js = require(__dirname + "/../../src/js/components/components.js");

/***********************************************************************************************//**
 *  @See https://www.chaijs.com/
 *  @See https://mochajs.org/
 **************************************************************************************************/
describe("Unit testing models", function()
{
    it("should add a test component", function()
    {
        var comp_type = "Battery";
        var comp_id = "id_test";

        components_js.model_add_component(comp_type, comp_id);
        assert.equal(comp_type, components[0].type);
        assert.equal(comp_id, components[0].id);
        expect(components.length, "Component hasn't been added").to.equal(1);
    });

    it("should add a parameter", function()
    {
        var comp_id = "id_test";
        var param_name = "capacity";
        var param_value = "cap_test";
        var this_ref = $(this);

        components_js.model_add_parameter(comp_id, param_name, param_value, this_ref);
        expect(Object.keys(components[0].parameters)[0]).to.equal(param_name);
        expect(components[0].parameters[param_name]).to.equal(param_value);
    });

    it("should add an input parameter and delete it", function()
    {
        var comp_id = "id_test";
        var param_name = "test_inputs";
        var param_value = "1";
        var this_ref = $(this);

        components_js.model_add_parameter(comp_id, param_name, param_value, this_ref);
        expect(components[0].variables.in[1].name).to.equal("inputs_analog0");

        components_js.model_delete_variables(comp_id, param_name);
        expect(components[0].variables.in.length, "unable to delete variable").to.equal(1);
    });

    it("should change the parameter value", function()
    {
        var comp_id = "id_test";
        var param_name = "capacity";
        var param_value = "new_cap_test";

        components_js.model_change_parameter(comp_id, param_name, param_value);
        expect(Object.keys(components[0].parameters)[0]).to.equal(param_name);
        expect(components[0].parameters[param_name]).to.equal(param_value);
    });

    it("should edit the component id", function()
    {
        var comp_id = "id_test";
        var new_id = "new_id_test";

        components_js.model_edit_component_id(comp_id, new_id);
        expect(components[0].id, "Cannot change the name ID").to.equal("new_id_test");
    });

    it("should delete the component", function()
    {
        var comp_id = "new_id_test";

        components_js.model_delete_component(comp_id);
        expect(components.length, "Component hasn't been deleted").to.equal(0);
    });
});

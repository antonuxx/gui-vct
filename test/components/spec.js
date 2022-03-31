/***********************************************************************************************//**
 *  DOM testing of the application
 *  @file       spec.js
 *  @author     Anton Villalonga, antonuxx@gmail.com
 *  @date       2020-nov-20
 *  @copyright  This file is part of a project developed at Nano-Satellite and Payload Laboratory
 *              (NanoSat Lab), Universitat Politècnica de Catalunya - UPC BarcelonaTech.
 **************************************************************************************************/

const Application = require("spectron").Application
const assert = require("assert")
const electron_path = require("electron");
const path = require("path");
const app_path = [path.join(__dirname, "../../src/")];
const fs = require("fs");

/* Utility functions */
const sleep = time => new Promise(r => setTimeout(r, time));

process.env.NODE_ENV = "test";

const app = new Application(
{
    path: electron_path,
    args: app_path
});

describe("Application launch", function ()
{
    this.timeout(40000);

    this.beforeAll(function ()
    {
        return app.start()
    });

    it("shows an initial window", function ()
    {
        return app.client.getWindowCount().then(function (count)
        {
            assert.equal(count, 1);
        });
    });

    it("Introduces 'bat_comp' battery to the list", async () =>
    {
        await sleep(500);
        const input_comp_id = await app.client.$("#comp_id");
        await input_comp_id.addValue("bat_comp");
        await sleep(200);
        const btn_create = await app.client.$(".btn_create");
        await btn_create.click();
    });

    it("Introduces 'another_comp' battery to the list", async () =>
    {
        await sleep(500);
        const types_dropdown = await app.client.$("#comp_types");
        await types_dropdown.click();
        await sleep(200);
        await types_dropdown.selectByAttribute("value", "Another");
        const input_comp_id = await app.client.$("#comp_id");
        await input_comp_id.clearValue();
        await input_comp_id.addValue("another_comp");
        const btn_create = await app.client.$(".btn_create");
        await sleep(200);
        await btn_create.click();
    });

    it("Rename 'bat_comp' to 'edited_bat' battery", async() =>
    {
        await sleep(500);
        const edit_comp_id = await app.client.$(".btn_edit_bat_comp");
        const edit_input = await app.client.$("#edit_bat_comp");
        await edit_comp_id.click();
        await sleep(200);
        await edit_input.setValue("edited_bat");
        await app.client.keys("\uE007"); /* Simulates client enter key */
    });

    it("Fill capacity parameter from edited_bat", async() =>
    {
        await sleep(500);
        const component = await app.client.$("[name='edited_bat']");
        const capacity_field = await app.client.$("#test_param_capacity");
        const param2_field = await app.client.$("#test_param_param2");
        await component.click();
        await sleep(200);
        await capacity_field.click();
        await capacity_field.addValue("test_value_capacity");
        await app.client.keys("\uE007");
        await sleep(200);
        await param2_field.click();
        await param2_field.addValue("test_value_param2");
        await app.client.keys("\uE007");
    });

    it("Deletes battery component", async() =>
    {
        await sleep(500);
        const btn_delete_component = await app.client.$("//*[@id='edited_bat']/button[1]"); /* webdriverio xpath. */
        await btn_delete_component.click();
        await sleep(500);
        await app.client.keys("\uE007");
        await sleep(200);
        await app.client.keys("\uE007");
    });

    it("Initiating alerts system: 1) Creating a component with same id", async() =>
    {
        await sleep(500);
        const input_comp_id = await app.client.$("#comp_id");
        await input_comp_id.clearValue();
        await sleep(200);
        await input_comp_id.addValue("another_comp");
        await sleep(200);
        const btn_create = await app.client.$(".btn_create");
        await btn_create.click();
        await sleep(500);
        await app.client.keys("\uE007");
    });

    it("2) Alerts component cannot be renamed to an existing component", async() =>
    {
        await sleep(500);
        const edit_comp_id = await app.client.$(".btn_edit_another_comp");
        const edit_input = await app.client.$("#edit_another_comp");
        await edit_comp_id.click();
        await sleep(200);
        await edit_input.setValue("another_comp");
        await app.client.keys("\uE007"); /* Simulates client enter key */
        await sleep(500);
        await app.client.keys("\uE007");
    });

    it("Fill capacity parameter from edited_bat", async() =>
    {
        await sleep(500);
        const component = await app.client.$("[name='another_comp']");
        const capacity_field = await app.client.$("#test_param_capacity_another");
        await component.click();
        await sleep(200);
        await capacity_field.click();
        await capacity_field.addValue("test_value_capacity");
        await app.client.keys("\uE007");
    });

    it("Introduces 'bat_comp' battery to the list", async () =>
    {
        await sleep(500);
        const types_dropdown = await app.client.$("#comp_types");
        await types_dropdown.click();
        await sleep(200);
        await types_dropdown.selectByAttribute("value", "Battery");
        const input_comp_id = await app.client.$("#comp_id");
        await input_comp_id.clearValue();
        await input_comp_id.addValue("bat_comp");
        const btn_create = await app.client.$(".btn_create");
        await sleep(200);
        await btn_create.click();
        var component = await app.client.$("[name = 'bat_comp']");
        await component.click();
    });

    it("Alerts unvalid number", async() =>
    {
        const channels_field = await app.client.$("#test_param_channels");
        await sleep(500);
        await channels_field.click();
        await channels_field.addValue("random value");
        await app.client.keys("\uE007");
        await sleep(500);
        await app.client.keys("\uE007");
    });

    it("Creates a valid number of channels", async() =>
    {
        const channels_field = await app.client.$("#test_param_channels");
        await channels_field.click();
        await channels_field.clearValue();
        await sleep(200);
        await channels_field.addValue("5");
        await app.client.keys("\uE007");
    });

    it("Disable the variables enabled by channels", async() =>
    {
        const channels_field = await app.client.$("#test_param_channels");
        await sleep(500);
        await channels_field.click();
        await channels_field.clearValue();
        await sleep(200);
        await channels_field.addValue("false");
        await app.client.keys("\uE007");
        await sleep(500);
        await app.client.keys("\uE007");
    });

    /***********************************************************************************************//**
     * Adding a sat to test system's visual. Note that satellite isn't tested as we use external lib.
     **************************************************************************************************/

    it("Changes to satellite window, adds satellite", async() =>
    {
        await sleep(500);
        const satellite_tab = await app.client.$("#test_sat_tab");
        await satellite_tab.click();
        await sleep(200);

        const input_sat_id = await app.client.$("#sat_id");
        await input_sat_id.addValue("sat_a");
        await sleep(500);
        const btn_create = await app.client.$(".btn_create_sat");
        await btn_create.click();
    });

    it("Changed to system window", async() =>
    {
        await sleep(500);
        const system_tab = await app.client.$("#test_sys_tab");
        await system_tab.click();
    });

    it("Creates a single orbit", async() =>
    {
        await sleep(500);
        const input_sys_id = await app.client.$("#single_id");
        const ecc_input = await app.client.$("#single_ecc");
        const sma_input = await app.client.$("#single_sma");
        const incl_input = await app.client.$("#single_incl");
        const raan_input = await app.client.$("#single_raan");
        const argp_input = await app.client.$("#single_argp");
        const ma_input = await app.client.$("#single_ma");
        const create_single = await app.client.$("#create_single");

        await input_sys_id.addValue("system_a");
        await ecc_input.addValue("0.5");
        await sma_input.addValue("100");
        await incl_input.addValue("50");
        await raan_input.addValue("70");
        await argp_input.addValue("50");
        await ma_input.addValue("70");
        await create_single.click();
    });

    it("Clears the form", async() =>
    {
        await sleep(500);
        const clear_single = await app.client.$("#clear_single");
        await clear_single.click();
    });

    it("Creates another sat", async() =>
    {
        await sleep(500);
        const input_sys_id = await app.client.$("#single_id");
        const selector_sat_type = await app.client.$("#sat_types");
        const ecc_input = await app.client.$("#single_ecc");
        const sma_input = await app.client.$("#single_sma");
        const incl_input = await app.client.$("#single_incl");
        const raan_input = await app.client.$("#single_raan");
        const argp_input = await app.client.$("#single_argp");
        const ma_input = await app.client.$("#single_ma");
        const create_single = await app.client.$("#create_single");

        await input_sys_id.addValue("system_a");
        await selector_sat_type.selectByAttribute("value", "sat_a");
        await ecc_input.addValue("0.7");
        await sma_input.addValue("105");
        await incl_input.addValue("55");
        await raan_input.addValue("75");
        await argp_input.addValue("55");
        await ma_input.addValue("75");
        await create_single.click();
    });

    it("Removes a sat", async() =>
    {
        await sleep(500);

        const delete_sat_btn = await app.client.$("#delete_orbit");
        await delete_sat_btn.click();
    });

    it("Adds another sat and renames the system", async () =>
    {
        await sleep(500);

        const create_single = await app.client.$("#create_single");

        await create_single.click();

        await sleep(200);
        const edit_system = await app.client.$("#td_single_id");
        await edit_system.setValue("_edited");
    });

    it("Comproves alert system", async() =>
    {
        await sleep(500);
        const input_sys_id = await app.client.$("#single_id");
        const selector_sat_type = await app.client.$("#sat_types");
        const ecc_input = await app.client.$("#single_ecc");
        const sma_input = await app.client.$("#single_sma");
        const incl_input = await app.client.$("#single_incl");
        const raan_input = await app.client.$("#single_raan");
        const argp_input = await app.client.$("#single_argp");
        const ma_input = await app.client.$("#single_ma");
        const create_single = await app.client.$("#create_single");
        const clear_single = await app.client.$("#clear_single");

        await clear_single.click();
        await create_single.click();
        await sleep(200);
        await app.client.keys("\uE007");
        await input_sys_id.addValue("system_a_edited");
        await selector_sat_type.selectByAttribute("value", "sat_a");
        await ecc_input.addValue("0.7");
        await sma_input.addValue("105");
        await raan_input.addValue("75");
        await argp_input.addValue("55");
        await ma_input.addValue("75");
        await create_single.click();
        await sleep(200);
        await app.client.keys("\uE007");
        await incl_input.addValue("random");
    });

    it("Changes to globals, get YAML configuration", async() =>
    {
        await sleep(500);
        const globals_tab = await app.client.$("#test_globals_tab");
        await globals_tab.click();
        await sleep(200);
        await app.client.keys("\uE007");
        await globals_tab.click();
        const btn_store = await app.client.$("#save_configuration");
        await sleep(200);
        await btn_store.click();
    });
});

/***********************************************************************************************//**
 *  Back-end for system's window behaviour.
 *  @class      system.js
 *  @author     Anton Villalonga, antonuxx@gmail.com
 *  @date       2020-nov-20
 *  @copyright  This file is part of a project developed at Nano-Satellite and Payload Laboratory
 *              (NanoSat Lab), Universitat Politècnica de Catalunya - UPC BarcelonaTech.
 **************************************************************************************************/

/***********************************************************************************************//**
 *  Perform an asynchronous HTTP (Ajax) request to obtain and store in variables, the local
 *  configured_satellites object.
 **************************************************************************************************/
$.ajax(
{
    url : "jsonFiles/system/system_model.json",
    dataType : "json",
    success : function(system_file)
    {
        systems_file = system_file;
        systems_model = systems_file.systems;
    }
});

/***********************************************************************************************//**
 *  @method load_system_tree
 *  Updates the system tree by matching with the current satellite's model configuration.
 **************************************************************************************************/
function load_system_tree()
{
    for(var i = 0; i < satellites_model.length; i++) {
        satellite = satellites_model[i];
        var tree_satellite =
            {
                "id": satellites_model[i].id,
                "parent": configured_satellites,
                "text": satellites_model[i].id
            };
        $.jstree.reference("jstree_system").create_node("configured_satellites", tree_satellite);
        tree_system_add_satellite_parameters(satellite, tree_satellite);
    };
};

/***********************************************************************************************//**
 *  @method search_component_model
 *  @param comp_id
 *  Search and return the component model that matches "comp_id"
 **************************************************************************************************/
function search_component_model(comp_id)
{
    var component_model = false;
    for(var i = 0; i < components.length; i++) {
        if(components[i].id === comp_id) {
            component_model = components[i];
        };
    };
    return component_model;
};

/***********************************************************************************************//**
 *  @method tree_system_add_satellite_parameters
 *  @param satellite object from sat's model
 *  @param tree_satellite object from jstree.
 *  Fill the parameters of each created satellite for the tree-view
 **************************************************************************************************/
function tree_system_add_satellite_parameters(satellite, tree_satellite)
{
    var m_parent = $("#jstree_system").jstree(true).get_node(configured_satellites);
    var sat_components =
    {
        "id": tree_satellite.id + "components",
        "parent": tree_satellite.id,
        "text": "Components"
    };
    $.jstree.reference("jstree_system").create_node(tree_satellite.id, sat_components);

    var sat_links =
    {
        "id": tree_satellite.id + "links",
        "parent": tree_satellite.id,
        "text": "Links"
    };
    $.jstree.reference("jstree_system").create_node(tree_satellite.id, sat_links);

    var sat_devices =
    {
        "id": tree_satellite.id + "devices",
        "parent": tree_satellite.id,
        "text": "Devices"
    };
    $.jstree.reference("jstree_system").create_node(tree_satellite.id, sat_devices);

    var sat_stack =
    {
        "id": tree_satellite.id + "stack",
        "parent": tree_satellite.id,
        "text": "Stack"
    };
    $.jstree.reference("jstree_system").create_node(tree_satellite.id, sat_stack);

    /* Add components and parameters */
    for(var i = 0; i < satellite.models.length; i++) {
        m_satellite = $("#jstree_system").jstree(true).get_node(tree_satellite);
        comp_id = satellite.models[i].id;
        comp_unique_id = comp_id.substr(0, comp_id.lastIndexOf("_"));
        component_model = search_component_model(comp_unique_id);
        found = false;

        for(var j = 0; j < m_satellite.children_d.length; j++) {
            if(m_satellite.children_d[j] === tree_satellite.id + comp_id) {
                found = true;
            };
        };
        if(found === false) {
            var sat_component =
            {
                "id": tree_satellite.id + comp_id,
                "parent": tree_satellite.id + "components",
                "text": component_model.type + "::" + comp_id
            };
            $.jstree.reference("jstree_system").create_node(tree_satellite.id + "components", sat_component);
            tree_system_add_component_parameters(sat_component, component_model);
        };
    };
    /* Add links */
    for(var i = 0; i < satellite.links.length; i++) {
        m_link = satellite.links[i];
        var link =
        {
            "id": sat_links.id + i,
            "parent": sat_links.id,
            "text": "Link" + i
        };
        $.jstree.reference("jstree_system").create_node(sat_links.id, link);

        var link_out =
        {
            "id": sat_links.id + i + "out",
            "parent": sat_links.id + i,
            "text": "out: " + m_link.out
        };
        $.jstree.reference("jstree_system").create_node(sat_links.id + i, link_out);

        var link_in =
        {
            "id": sat_links.id + i + "in",
            "parent": sat_links.id + i,
            "text": "in: " + m_link.in
        };
        $.jstree.reference("jstree_system").create_node(sat_links.id + i, link_in);
    };
};

/***********************************************************************************************//**
 *  @method tree_system_add_component_parameters
 *  @param sat_component object from sat's model.
 *  @param component_model object from comp's model.
 *  Updates the parameters of each component on jstree.
 **************************************************************************************************/
function tree_system_add_component_parameters(sat_component, component_model)
{
    $.each(component_model.parameters, function(parameter_name, parameter_value)
    {
        var tree_parameter =
        {
            "id": sat_component.id + component_model.id + parameter_name,
            "parent": sat_component.id,
            "text": parameter_name + "::" + parameter_value
        };
        $.jstree.reference("#jstree_system").create_node(sat_component.id, tree_parameter);
    });
};

/***********************************************************************************************//**
 *  @method empty_tree_system
 *  Empties the jstree from system view.
 **************************************************************************************************/
function empty_tree_system()
{
    var parent = $("#jstree_system").jstree(true).get_node(configured_satellites);

    if(parent.children.length !== 0) {
        var tree_children = $("#jstree_system").jstree(true).get_node(parent).children;
        for(var i = 0; i < tree_children.length; i++) {
            var sat = $("#jstree_system").jstree(true).get_node(tree_children[i]);
            var sat_children = $("#jstree_system").jstree(true).get_node(sat).children;
            $("#jstree_system").jstree(true).delete_node(sat_children);
        };
        var sat_children = $("#jstree_system").jstree(true).get_node(tree_children).children;
        //$("#jstree_system").jstree(true).delete_node(sat_children);
        $("#jstree_system").jstree(true).delete_node(tree_children);
    };
};

/***********************************************************************************************//**
 * Get the element with id=const_types and change the constellation element to be shown if the
 * dropdown option is changed.
 **************************************************************************************************/
$(function()
{
    $("#const_types").change(function()
    {
        $(".constellation").hide();
        $("#" + $(this).val()).show();
    });
});

$(".single_form_items").on("blur", "#single_ecc", function()
{
    var value = parseFloat($(this).val().replace(",","."));

    if(isNaN(value)) {
        Swal.fire(
            "Aborted",
            "Eccentricity must be a number",
            "warning"
        );
        $(this).val("");
    };

    if(value > 1 || value < 0) {
        Swal.fire(
            "Aborted",
            "Eccentricity must be (0 < e < 1)",
            "warning"
        );
        $(this).val("");
    };
});

$(".single_form_items").on("blur", "#single_sma", function()
{
    var value = parseFloat($(this).val().replace(",","."));
    if(isNaN(value)) {
        Swal.fire(
            "Aborted",
            "Semi major axis must be a number",
            "warning"
        );
        $(this).val("");
    };

    if(value < 0) {
        Swal.fire(
            "Aborted",
            "Positive value required",
            "warning"
        );
        $(this).val("");
    };
});

$(".single_form_items").on("blur", "#single_incl", function()
{
    var value = parseFloat($(this).val().replace(",","."));

    if(isNaN(value)) {
        Swal.fire(
            "Aborted",
            "Inclination must be a number",
            "warning"
        );
        $(this).val("");
    };

    if(value > 180 || value < 0) {
        Swal.fire(
            "Aborted",
            "Inclination must be (0 < incl < 180)",
            "warning"
        );
        $(this).val("");
    };
});

$(".single_form_items").on("blur", "#single_raan", function()
{
    var value = parseFloat($(this).val().replace(",","."));

    if(isNaN(value)) {
        Swal.fire(
            "Aborted",
            "Longitude must be a number",
            "warning"
        );
        $(this).val("");
    };

    if(value > 360 || value < 0) {
        Swal.fire(
            "Aborted",
            "Angle must be (0 < raan < 360)",
            "warning"
        );
        $(this).val("");
    };
});

$(".single_form_items").on("blur", "#single_argp", function()
{
    var value = parseFloat($(this).val().replace(",","."));

    if(isNaN(value)) {
        Swal.fire(
            "Aborted",
            "Argument must be a number",
            "warning"
        );
        $(this).val("");
    };

    if(value > 90 || value < 0) {
        Swal.fire(
            "Aborted",
            "Angle of periapsis must be (0 < Argp < 90)",
            "warning"
        );
        $(this).val("");
    };
});

$(".single_form_items").on("blur", "#single_ma", function()
{
    var value = parseFloat($(this).val().replace(",","."));

    if(isNaN(value)) {
        Swal.fire(
            "Aborted",
            "Mean anomaly must be a number",
            "warning"
        );
        $(this).val("");
    };

    if(value > 360 || value < 0) {
        Swal.fire(
            "Aborted",
            "Angle must be (0 < Ma < 360)",
            "warning"
        );
        $(this).val("");
    };
});

/* Adds an Event Listener for the "create orbit" option */
$(".system_header").on("click", "#create_single", function()
{
    const sat_type = $("#sat_types").val();
    const orbit_id = $("#single_id").val().replace(/\s/g, "");
    const ecc = parseFloat($("#single_ecc").val().replace(/\s/g, "").replace(",","."));
    const sma = parseFloat($("#single_sma").val().replace(/\s/g, "").replace(",","."));
    const incl = parseFloat($("#single_incl").val().replace(/\s/g, "").replace(",","."));
    const raan = parseFloat($("#single_raan").val().replace(/\s/g, "").replace(",","."));
    const argp = parseFloat($("#single_argp").val().replace(/\s/g, "").replace(",","."));
    const ma = parseFloat($("#single_ma").val().replace(/\s/g, "").replace(",","."));
    var existing_system_id = false;
    satellite = satellites_model.find(x => x.id === sat_type);

    if(sat_type === "" || orbit_id === "" || isNaN(ecc) || isNaN(sma) || isNaN(incl) || isNaN(raan)
    || isNaN(argp) || isNaN(ma)) {
        Swal.fire(
            "Aborted",
            "All parameters from the orbit must be filled",
            "warning"
        );
    } else {
        if(systems_model.length > 0) {
            $.each(systems_model, function(system_index, system)
            {
                if(system.id === orbit_id) {
                    existing_system_id = true;
                };
            });
        };
        if(existing_system_id === false) {
            modelsys_add_single_system(sat_type, orbit_id, ecc, sma, incl, raan, argp, ma);
        } else {
            modelsys_add_satellite(sat_type, orbit_id, ecc, sma, incl, raan, argp, ma);
        };
    };
});

/***********************************************************************************************//**
 * @method next_sat_id
 * @param orbit_id id from the system_model
 * @param m_sat_id
 * Search the next object in system.space array and return it.
 **************************************************************************************************/
function next_sat_id(orbit_id, m_sat_id)
{
    var id_repeated_satellites = 0;
    var free_sat_id = m_sat_id;
    var m_sat_type = m_sat_id.substr(0, m_sat_id.lastIndexOf("_"));
    var m_system = systems_model.find(x => x.id === orbit_id);

    $.each(m_system.space, function(sat_index, sat)
    {
        if(sat_index === free_sat_id) {
            var last_found = false;

            while(last_found === false)
            {
                var existant_sat = m_system.space[m_sat_type + "_" + id_repeated_satellites];

                if(existant_sat === undefined) {
                    last_found = true;
                } else {
                    id_repeated_satellites++;
                };
            };
            free_sat_id = m_sat_type + "_" + id_repeated_satellites;
        };
    });
    return free_sat_id;
};

/***********************************************************************************************//**
 * @method create_single
 * @param m_sat_id
 * @param sat_type
 * @param ecc, Eccentricity
 * @param sma Semi axis
 * @param incl Inclination
 * @param raan Ascending node
 * @param argp Periapsis
 * @param ma Mean anomaly
 * Reads the values set by user and inserts a row to the table.
 **************************************************************************************************/
function create_single(m_sat_id, sat_type, orbit_id, ecc, sma, incl, raan, argp, ma)
{
    var new_single_orbit = "<tr id =" + orbit_id + "><td id ='sat_type'>" + m_sat_id;
    new_single_orbit += "</td><td contenteditable id ='td_single_id'>" + orbit_id + "</td><td id ='ecc' contenteditable>" + ecc;
    new_single_orbit += "</td><td id ='sma' contenteditable>" + sma + "</td><td id ='incl' contenteditable>";
    new_single_orbit += incl + "</td><td id ='raan' contenteditable>" + raan;
    new_single_orbit += "</td><td id ='argp' contenteditable>" + argp + "</td><td id ='ma' contenteditable>";
    new_single_orbit += ma + "</td><td class ='centered'><button id ='delete_orbit'>";
    new_single_orbit += "<span class ='icon icon-cancel'></span></button></td></tr>";

    $("#system_tbl_body").append(new_single_orbit);
};

/***********************************************************************************************//**
 * @method modelsys_add_single_system
 * @param m_sat_id
 * @param sat_type
 * @param ecc, Eccentricity
 * @param sma Semi axis
 * @param incl Inclination
 * @param raan Ascending node
 * @param argp Periapsis
 * @param ma Mean anomaly
 * Adds new orbit to the system's model
 **************************************************************************************************/
function modelsys_add_single_system(sat_type, orbit_id, ecc, sma, incl, raan, argp, ma)
{
    var m_sat_id = sat_type + "_0";

    var system = {};
    system["id"] = orbit_id;
    system["space"] = {};
    system["ground"] = [];

    var sat = {};
    sat["id"] = m_sat_id;
    sat["type"] = sat_type;
    sat["orbit"] = {};
    sat["network"] = {adress: "00:00:00:00:00:02"};

    var orbit = {};
    orbit["sma"] = sma;
    orbit["ecc"] = ecc;
    orbit["inc"] = incl;
    orbit["raan"] = raan;
    orbit["argp"] = argp;
    orbit["ma"] = ma;
    sat["orbit"] = orbit;

    system.space[m_sat_id] = sat;
    systems_model.push(system);
    create_single(m_sat_id, sat_type, orbit_id, ecc, sma, incl, raan, argp, ma);
};

function modelsys_rename_system(system, new_id)
{
    system.id = new_id;
    $("#system_tbl_body > tr").each(function(tr_index, tr)
    {
        $(tr).find("#td_single_id").text(new_id);
    });
};

/***********************************************************************************************//**
 * @method modelsys_add_satellite
 * @param m_sat_id
 * @param sat_type
 * @param ecc, Eccentricity
 * @param sma Semi axis
 * @param incl Inclination
 * @param raan Ascending node
 * @param argp Periapsis
 * @param ma Mean anomaly
 * Adds a satellite to the orbit_id system.
 **************************************************************************************************/
function modelsys_add_satellite(sat_type, orbit_id, ecc, sma, incl, raan, argp, ma)
{
    var m_sat_id = sat_type + "_0";

    if(systems_model.length > 0) {
        m_sat_id = next_sat_id(orbit_id, m_sat_id);
    };

    system = systems_model.find(x => x.id === orbit_id);

    var sat = {};
    sat["id"] = m_sat_id;
    sat["type"] = sat_type;
    sat["orbit"] = {};
    sat["network"] = {adress: "00:00:00:00:00:02"};

    var orbit = {};
    orbit["sma"] = sma;
    orbit["ecc"] = ecc;
    orbit["inc"] = incl;
    orbit["raan"] = raan;
    orbit["argp"] = argp;
    orbit["ma"] = ma;
    sat["orbit"] = orbit;

    system.space[m_sat_id] = sat;
    create_single(m_sat_id, sat_type, orbit_id, ecc, sma, incl, raan, argp, ma);
};

/* Clears the input fields */
$(".system_header").on("click", "#clear_single", function()
{
    $("#sat_types").val("");
    $("#single_id").val("");
    $("#single_ecc").val("");
    $("#single_sma").val("");
    $("#single_incl").val("");
    $("#single_raan").val("");
    $("#single_argp").val("");
    $("#single_ma").val("");
});

/* Deletes the row */
$("#system_tbl_body").on("click", "#delete_orbit", function()
{
    const system_id = $(this).parents().eq(1).find("#td_single_id").text();
    const sat_id = $(this).parents().eq(1).find("#sat_type").text();
    const sat_type = sat_id.substr(0, sat_id.lastIndexOf("_"));
    var system = systems_model.find(x => x.id === system_id);

    modelsys_delete_satellite(system_id, sat_id);
    if($.isEmptyObject(system.space) === true) {
        modelsys_delete_system(system_id);
    };
    $(this).parents().eq(1).remove();
});

/***********************************************************************************************//**
 * Listen for contenteditable fields to be blurred and therefore, activate the blur event.
 **************************************************************************************************/
$("#system_tbl_body").on("keypress", "[contenteditable]", function(event)
{
    if(event.keyCode == "13") {
        $(this).blur();
    };
});

/***********************************************************************************************//**
 * Checks if parameter is already defined, if isn't creates it, if is, changes it.
 * Checks if contenteditable is empty and deletes the component if it was defined.
 * This in only programmed for the single orbit case.
 **************************************************************************************************/
$("#system_tbl_body").on("blur", "[contenteditable]", function(event)
{
    const current_id = $(this).parents().eq(1).prevObject[0].id;
    const system_id = $(this).parent().find("#td_single_id").text();
    const satellite_id = $(this).parent().find("#sat_type").text();
    const orbital_param = this.id;
    const orbital_param_value = this.innerText;
    var system = systems_model.find(x => x.id === current_id);
    var satellite_orbit = system.space[satellite_id].orbit; /* space[0] as single constellation only have one orbit */
    var existant_param_value = false;
    var existing_system_id = false;

    $.each(satellite_orbit, function(param_name, param_value)
    {
        if(param_name === orbital_param && param_value === orbital_param_value) {
            existant_param_value = true;
        };
    });

    if($.trim(orbital_param_value) != "" && existant_param_value === false) {
        this.innerText = orbital_param_value;
        satellite_orbit[orbital_param] = orbital_param_value;
        if(orbital_param === "td_single_id") {
            modelsys_rename_system(system, orbital_param_value);
        };
    } else {
        if($.trim(orbital_param_value) != "" && existant_param_value === true) {
            this.innerText = satellite_orbit[orbital_param];
        } else if ($.trim(orbital_param_value) === "") {
            this.innerText = current_id;
        };
    };

    if(orbital_param === "td_single_id") {
        $.each(systems_model, function(system_index, system)
        {
            if(system.id === system_id) {
                existing_system_id = true;
            };
        });
    };
});

/***********************************************************************************************//**
 *  @method modelsys_delete_system
 *  @param system_id
 *  Deletes the system selected
 **************************************************************************************************/
function modelsys_delete_system(system_id)
{
    for(var i = systems_model.length - 1; i >= 0; i--) {
        if(systems_model[i].id === system_id) {
            systems_model.splice(i, 1);
        };
    };
};

/***********************************************************************************************//**
 *  @method modelsys_delete_satellite
 *  @param system_id
 *  @param sat_id
 *  Deletes the satellite selected
 **************************************************************************************************/
function modelsys_delete_satellite(system_id, sat_id)
{
    system = systems_model.find(x => x.id === system_id);

    $.each(system.space, function(sat_index, sat)
    {
        if(sat_index === sat_id) {
            delete system.space[sat_index];
        };
    });
};

/***********************************************************************************************//**
 *  @method load_sat_types
 *  Gets the list of satellites and creates an option for each to the sat_types selectable.
 **************************************************************************************************/
function load_sat_types()
{
    $.each(satellites_model, function(sat_index, sat)
    {
        $("#sat_types").append($("<option />").val(sat.id).text(sat.id));
    });
};

/***********************************************************************************************//**
 *  @method empty_sat_types
 *  Empties the list of satellites when user changes view
 **************************************************************************************************/
function empty_sat_types()
{
    $("#sat_types").empty();
};

/***********************************************************************************************//**
 *  @method modelsat_save_models
 *  @param system object from systems's model array
 *  Defines an object representing a system and returns it.
 **************************************************************************************************/
function modelsys_save_systems(system)
{
    var m_system = {};
    m_system["space"] = {};
    m_system["ground"] = [];

    $.each(system.space, function(sat_key, sat)
    {
        var m_sat = {};
        m_sat_id = sat.id;
        m_sat["type"] = sat.type;
        m_sat["orbit"] = sat.orbit;
        m_sat["network"] = sat.network;

        m_system.space[m_sat_id] = m_sat;
    });
    return m_system;
};

/***********************************************************************************************//**
 *  @method updte_systems
 *  Updates systems model according to satellites's current configuration
 **************************************************************************************************/
function update_systems()
{
    $.each(systems_model, function(system_index, system)
    {
        var found = false;
        const system_id = system.id;
        $.each(system.space, function(sat_index, sat)
        {
            const sat_id = sat.id;
            const sat_type = sat.type;

            $.each(satellites_model, function(m_sat_index, m_sat)
            {
                const m_sat_id = m_sat.id;
                if(sat_type === m_sat_id) {
                    found = true;
                };
            });
            if(found === false) {
                modelsys_delete_satellite(system_id, sat_id);

                $("td:contains(" + sat_id + ")").parent().remove();
                if($.isEmptyObject(system.space) === true) {
                    modelsys_delete_system(system_id);
                };
            };
        });

    });
};

/***********************************************************************************************//**
 *  @method save_systems
 *  Save the configuration to yaml files
 **************************************************************************************************/
function save_systems()
{
    update_systems();
    var yaml_systems = {};

    $.each(systems_model, function(system_key, system)
    {
        yaml_systems[system.id] = modelsys_save_systems(system);
    });

    fs.writeFile(__dirname + "/yaml_configurations/systems.yml", yaml.dump(yaml_systems, {noRefs: true}), function(err)
    {
        if (err) {
            console.log(err);
        };
    });
};

/* Exports functionalities for unit testing */
module.exports =
{
    modelsys_add_single_system,
    modelsys_rename_system,
    modelsys_add_satellite,
    modelsys_delete_satellite,
    modelsys_delete_system,
    modelsys_save_systems
};

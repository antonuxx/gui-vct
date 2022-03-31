/***********************************************************************************************//**
 *  Back-end for components's window behaviour.
 *  @file       components.js
 *  @author     Anton Villalonga, antonuxx@gmail.com
 *  @date       2020-nov-20
 *  @copyright  This file is part of a project developed at Nano-Satellite and Payload Laboratory
 *              (NanoSat Lab), Universitat Politècnica de Catalunya - UPC BarcelonaTech.
 **************************************************************************************************/

const fs = require("fs"); /* require Nodejs file system module */
/***********************************************************************************************//**
 *  Perform an asynchronous HTTP (Ajax) request to obtain and store in variables, the local
 *  physical_components and configuration objects.
 **************************************************************************************************/
$.ajax(
{
    url : "jsonFiles/physical_components.json", /* Information of the available components */
    dataType : "json",
    success : function(physical_file)
    {
       physical_components_file = physical_file;
       physical_components = physical_file.components;
    }
});

$.ajax(
{
    url : "jsonFiles/configured_components.json", /* Configuration object file, dynamically filled during config. */
    dataType : "json",
    success : function(config_file)
    {
        configured_comps = config_file;
        components = config_file.configured_components;

        /***********************************************************************************************//**
         *  Waits for the page/DOM to be ready, read physical_components object and populates the options
         *  that determines the type of the components that can be created.
         **************************************************************************************************/
        var comp_types = $("#comp_types");
        $.each(physical_components, function(component_key, component)
        {
            comp_types.append($("<option />").val(component.type).text(component.type));
        });
    }
});

/***********************************************************************************************//**
 * Adds an addEventListener for each collapsible, toggle collapsible's active class and
 * swithes their content between none and block if user clicks on any of them.
 * *COLLAPSIBLE*: Html element defined by a clickable item that expands.
 * @See https://www.w3schools.com/howto/howto_js_collapsible.asp
 **************************************************************************************************/
$(".components_window_content").on("click", ".comp_collapsible", function()
{
    var content = $(this).next();
    $(this).toggleClass("active");
    if ($(content).css("display") === "block") {
        $(content).css("display", "none");
    } else {
        $(content).css("display", "block");
    }
});

/***********************************************************************************************//**
 * Dynamically listen (jquery event delegation) for btn_clone elements to be clicked,
 * removes it's parent's next element (collapsible content), and the parent itself (collapsible).
 **************************************************************************************************/
$(".components_window_content").on("click", ".btn_close", function(event)
{
    event.stopPropagation(); /* Avoid click event propagation and therefore, to click collapsible */
    var current_id = $(this).next().next().attr("name");

    /************************************//**
     * @See https://sweetalert2.github.io/
     ***************************************/
    Swal.fire(
    {
        title: "Delete component?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) =>
    {
        /* Executes the following code if user clicks *Yes, delete it*. */
        if (result.isConfirmed) {
            model_delete_component(current_id);

            $(this).parent().next().remove();
            $(this).parent().remove();
        };
    })
});

/***********************************************************************************************//**
 * Listen for click event on .btn_create element's class and call the functions to create
 * new collapsible and it's content.
 * @See new_collapsible()
 **************************************************************************************************/
$(".btn_create").click(function()
{
    new_collpasible();
});

/***********************************************************************************************//**
 * Creates the elements for a new collapsible and append it at the end of components the list.
 **************************************************************************************************/
function new_collpasible()
{
    var comp_id = $("#comp_id").val().replace(/\s/g, "");
    var type = $("#comp_types").val();
    var collapsible = document.createElement("div");
    var btn_close = document.createElement("button");
    var close_span_icon = document.createElement("span");
    var btn_edit = document.createElement("button");
    var edit_span_icon = document.createElement("span");

    /* Fill the collapsible text. */
    var text = "<p name = " + comp_id + "><b>Name: </b><span class='collapsible_comp_id'>" + comp_id + "</span>";
    text += "<input id='edit_" + comp_id + "' class='input_comp_id'></input><b>Type: </b>" + type + "</p>";

    var existing_comp_id = false; /* Used to check if component already exists */
    $(".comp_collapsible").children("p").each(function(key, comp)
    {
        var comp_name = $(comp).attr("name");
        if(comp_name === comp_id) {
            existing_comp_id = true;
        }
    });
    if(existing_comp_id === false && comp_id.trim().length != 0) {
        /* components css from photon */
        $(btn_close).addClass("btn btn-mini btn-default btn_close");
        $(close_span_icon).addClass("icon icon-cancel pull-left");
        $(btn_edit).addClass("btn btn-mini btn-default btn_edit btn_edit_" + comp_id + "");
        $(btn_edit).css("margin-left", "15px");
        $(btn_edit).css("margin-right", "3px");
        $(edit_span_icon).addClass("icon icon-pencil");
        $(collapsible).addClass("collapsible_group comp_collapsible");
        $(collapsible).attr("type", type);
        $(collapsible).attr("name", comp_id);
        $(collapsible).attr("id", "edited_bat"); /* Testing purposes */

        $(btn_close).append(close_span_icon);
        $(btn_edit).append(edit_span_icon);
        $(collapsible).append(btn_close, btn_edit, text);
        $(".components_window_content").append(collapsible);

        new_content(type);
        model_add_component(type, comp_id);
    } else {
        if(existing_comp_id === true) {
            Swal.fire
            (
                "Aborted",
                "Components cannot have the same name ID",
                "warning"
            );
        } else {
            Swal.fire
            (
                "Aborted",
                "Components name ID cannot be empty",
                "warning"
            );
        };
    };
};

/***********************************************************************************************//**
 * Creates the new_content that shall be attached to the newest created collapsible.
 * @param type Type of the component, used to know what new element is being created
 * @param comp_id Sets the component id to the new collapsible and tree view.
 **************************************************************************************************/
function new_content(type)
{
    var new_content_div = document.createElement("div");
    $(new_content_div).addClass("content");

    var new_content = "<table id='comp_tbl' class='table_margin_bottom table-stripped'>";
    new_content += "<thead><tr><th style='width: 20%;'><b>Parameter</b></th><th><b>Value</b></th>";
    new_content += "<th style='width: 30%;'><b>Description</b></th></tr></thead><tbody>";

    $(physical_components).each(function(comp_key, comp)
    {
        if(comp.type === type) {
            /* Populates the collapsible's table content. */
            $.each(comp.parameters, function(param_key, param)
            {
                new_content += "<tr><td name = " + param_key + ">";
                new_content += "" + param_key + "</td>";
                new_content += "<td id = 'test_param_" + param_key + "'";
                new_content += "contenteditable></td><td>" + param + "</td></tr>";
            });
        }
    });
    new_content += "</tbody></table>";

    $(new_content_div).append(new_content);
    $(".components_window_content").append(new_content_div);
};

/***********************************************************************************************//**
 * Management of the object model that represents the current components configuration
 **************************************************************************************************/

/***********************************************************************************************//**
 * Creates an empty object {}, fills with the default information and push to the Model's array.
 * @param comp_type    type of the component, used to check it's variables.
 * @param comp_name    component name, sets the id of the component.
 **************************************************************************************************/
function model_add_component(comp_type, comp_name)
{
    var component = {};
    component["type"] = comp_type;
    component["id"] = comp_name;
    component["unique_id"] = comp_name;
    component["parameters"] = {};
    component["variables"] = {};
    /* Adding the "permanent" variables */
    component.variables["in"] = [];
    component.variables["out"] = [];
    component.variables["state"] = [];

    if(components.length > 0) {
        var unique_id_counter = 0;
        $.each(components, function(index_component, m_component)
        {
            if(comp_name === m_component.unique_id) {
                unique_id_counter++;
            };
        });
        component["unique_id"] = comp_name + unique_id_counter;
    };
    $.each(physical_components, function(component_index, physical_component)
    {
        if(physical_component.type === comp_type) {
            const variables = physical_component.variables;
            /* Inputs */
            /* Check if variables arrays are defined in physical_components */
            if(variables.in != null) { /* abstract quality operator, null == undefined is true */
                $.each(variables.in, function(input_index, input)
                {
                    if(input.enable_by == null) {
                        component.variables.in.push(input);
                    };
                });
            };
            if(variables.out != null) {
                /* Outputs */
                $.each(variables.out, function(output_index, output)
                {
                    if(output.enable_by == null) {
                        component.variables.out.push(output);
                    };
                });
            };
            if(variables.state != null) {
                /* State */
                $.each(variables.state, function(state_index, state)
                {
                    if(state.enable_by == null) {
                        component.variables.state.push(state);
                    };
                });
            };
        };
    });
    components.push(component);
};

/***********************************************************************************************//**
 * Changes the component id by replacing the *id* element.
 * @param component_id
 * @param new_id          New id to be set.
 **************************************************************************************************/
function model_edit_component_id(component_id, new_id)
{
    component = components.find(x => x.id === component_id);
    component["id"] = new_id;
};

/***********************************************************************************************//**
 * Deletes the component object from Model's array.
 * @param component_id
 **************************************************************************************************/
function model_delete_component(component_id)
{
    //await modelsat_delete_graph_node(component_id);

    for(var i = 0; i < components.length; i++) {
        if(components[i].id == component_id) {
            components.splice(i, 1);
            break;
        };
    };
};

/***********************************************************************************************//**
 * Find the component from Model array and adds a new element.
 * @param component_id
 * @param parameter_name    Sets the key of the pair.
 * @param parameter_values  Sets the value of the pair.
 **************************************************************************************************/
function model_add_parameter(component_id, parameter_name, parameter_value, this_ref)
{
    component = components.find(x => x.id === component_id);
    var physical_component = physical_components.find(x => x.type === component.type);
    /* Check if parameters enables any variable */
    var variables = physical_component.variables;

    /* Flags identifying if variables exists */
    var is_input = false;
    var is_output = false;
    var is_state = false;

    /* variables used if they match */
    var physical_input;
    var physical_output;
    var physical_state;

    /* Search if variable is some state */
    if(variables.in != null) {
        $.each(variables.in, function(input_index, input)
        {
            if(input.enable_by === parameter_name) {
                is_input = true;
                physical_input = input;
            };
        });
    };
    if(variables.out != null) {
        $.each(variables.out, function(output_index, output)
        {
            if(output.enable_by === parameter_name) {
                is_output = true;
                physical_output = output;
            };
        });
    };
    if(variables.state != null) {
        $.each(variables.state, function(state_index, state)
        {
            if(state.enable_by === parameter_name) {
                is_state = true;
                physical_state = state;
            };
        });
    };

    /* checks if user unables the parameter */
    if(parameter_value === "false" || parameter_value === "null" || parameter_value === "0") {
        Swal.fire(
            "Disabled",
            "Disabled variables enabled by " + parameter_name + "",
            "info"
        );
    } else if(is_input) { /* Variable is input, checks it's type and value, if correct, add to model */
        if(physical_input.type === "float") { /* If it's float, checks for the number entered */
            if(parameter_value > 0  && parameter_value <= 20) {
                for(var i = 0; i < parameter_value; i++) {
                    var m_input = {};
                    m_input["name"] = physical_input.name + i;
                    m_input["enable_by"] = parameter_name;
                    m_input["type"] = "float";
                    component.variables.in.push(m_input);
                };
                component.parameters[parameter_name] = parameter_value;
            } else {
                this_ref.text("");
                Swal.fire(
                "Aborted",
                "Please insert a valid number (see parameter description).",
                "warning"
                );
            };
        } else { /* If not float, user can put whatever they want */
            component.variables.in.push(physical_input);
            component.parameters[parameter_name] = parameter_value;
        }
    } else if(is_output) {
        if(physical_output.type === "float") { /* If it's float, checks for the number entered */
            if(parameter_value > 0  && parameter_value <= 20) {
                for(var i = 0; i < parameter_value; i++) {
                    var m_output = {};
                    m_output["name"] = physical_output.name + i;
                    m_output["enable_by"] = parameter_name;
                    m_output["type"] = "float";
                    component.variables.out.push(m_output);
                };
                component.parameters[parameter_name] = parameter_value;
            } else {
                this_ref.text("");
                Swal.fire(
                "Aborted",
                "Please insert a valid number (see parameter description).",
                "warning"
                );
            };
        } else { /* If not float, user can put whatever they want */
            component.variables.out.push(physical_output);
            component.parameters[parameter_name] = parameter_value;
        }
    } else if(is_state) {
        if(physical_state.type === "float") { /* If it's float, checks for the number entered */
            if(parameter_value > 0  && parameter_value <= 20) {
                for(var i = 0; i < parameter_value; i++) {
                    var m_state = {};
                    m_state["name"] = physical_state.name + i;
                    m_state["enable_by"] = parameter_name;
                    m_state["type"] = "float";
                    component.variables.state.push(m_state);
                };
                component.parameters[parameter_name] = parameter_value;
            } else {
                this_ref.text("");
                Swal.fire(
                "Aborted",
                "Please insert a valid number (see parameter description).",
                "warning"
                );
            };
        } else { /* If not float, user can put whatever they want */
            component.variables.state.push(physical_state);
            component.parameters[parameter_name] = parameter_value;
        }
    } else { /* If is not a variable, add the parameter to the list */
        component.parameters[parameter_name] = parameter_value;
    }
};

/***********************************************************************************************//**
 * Find the component from Model array and delete the element.
 * @param component_id
 * @param parameter_name
 **************************************************************************************************/
function model_delete_variables(component_id, parameter_name)
{
    var component = components.find(x => x.id === component_id);
    var physical_component = physical_components.find(x => x.type === component.type);
    var variables = physical_component.variables;
    var m_variables = component.variables;

    if(variables.in != null) {
        $.each(variables.in, function(input_index, input)
        {
            if(input.enable_by === parameter_name) {
                for(i = m_variables.in.length - 1; i >= 0; i--) {
                    if(m_variables.in[i].enable_by === parameter_name) {
                        m_variables.in.splice(i, 1);
                    }
                };
            };
        });
    };
    if(variables.out != null) {
        $.each(variables.out, function(output_index, output)
        {
            if(output.enable_by === parameter_name) {
                for(i = m_variables.out.length - 1; i >= 0; i--) {
                    if(m_variables.out[i].enable_by === parameter_name) {
                        m_variables.out.splice(i, 1);
                    }
                };
            };
        });
    };
    if(variables.state != null) {
        $.each(variables.state, function(state_index, state)
        {
            if(state.enable_by === parameter_name) {
                for(i = m_variables.state.length - 1; i >= 0; i--) {
                    if(m_variables.state[i].enable_by === parameter_name) {
                        m_variables.state.splice(i, 1);
                    }
                };
            };
        });
    };
};

/***********************************************************************************************//**
 * Find the component from Model array and update the element.
 * @param component_id
 * @param parameter_name    Sets the key of the pair.
 * @param parameter_values  Sets the value of the pair.
 **************************************************************************************************/
function model_change_parameter(component_id, parameter_name, parameter_value)
{
    var is_variable = false;
    var component = components.find(x => x.id === component_id);
    var physical_component = physical_components.find(x => x.type === component.type);
    var variables = physical_component.variables;
    var m_variables = component.variables;
    /* Check if parameters enables any variable */
    if(variables.in != null) {
        $.each(variables.in, function(input_index, input)
        {
            if(input.enable_by === parameter_name) { /* Checks if parameter_name is variable */
                is_variable = true;
                /* Deleting variables */
                for(i = m_variables.in.length - 1; i >= 0; i--) {
                    if(m_variables.in[i].enable_by === parameter_name) {
                        m_variables.in.splice(i, 1);
                    };
                };
                if(parameter_value === "false" || parameter_value === "null") {
                    Swal.fire
                    (
                        "Disabled inputs",
                        "Disabled inputs enabled by " + parameter_name + "",
                        "info"
                    );
                    model_delete_parameter(component_id, parameter_name);
                } else if(input.type === "float") {
                    if(parameter_value > 0 && parameter_value <= 20) {
                        for(var i = 0; i < parameter_value; i++) {
                            var m_input = {};
                            m_input = {};
                            m_input["name"] = input.name + i;
                            m_input["enable_by"] = parameter_name;
                            m_input["type"] = "float";
                            component.variables.in.push(m_input);
                        };
                    } else {
                        Swal.fire
                        (
                            "Aborted",
                            "Please insert a valid number (see parameter description).",
                            "warning"
                        )
                    };
                };
            } else {
                component.parameters[parameter_name] = parameter_value;
            };
        });
    };
    if(variables.out != null) {
        $.each(variables.out, function(output_index, output)
        {
            if(output.enable_by === parameter_name) { /* Checks if parameter_name is variable */
                is_variable = true;
                for(i = m_variables.out.length - 1; i >= 0; i--) {
                    if(m_variables.out[i].enable_by === parameter_name) {
                        m_variables.out.splice(i, 1);
                    };
                };
                if(parameter_value === "false" || parameter_value === "null") {
                    Swal.fire
                    (
                        "Disabled outputs",
                        "Disabled outputs enabled by " + parameter_name + "",
                        "info"
                    );
                    model_delete_parameter(component_id, parameter_name);
                } else if(output.type === "float") {
                    if(parameter_value > 0 && parameter_value <= 20) {
                        for(var i = 0; i < parameter_value; i++) {
                            var m_output = {};
                            m_output = {};
                            m_output["name"] = output.name + i;
                            m_output["enable_by"] = parameter_name;
                            m_output["type"] = "float";
                            component.variables.out.push(m_output);
                        };
                    } else {
                        Swal.fire
                        (
                            "Aborted",
                            "Please insert a valid number (see parameter description).",
                            "warning"
                        );
                    };
                };
            } else {
                component.parameters[parameter_name] = parameter_value;
            };
        });
    };
    if(variables.state != null) {
        $.each(variables.state, function(state_index, state)
        {
            if(state.enable_by === parameter_name) { /* Checks if parameter_name is variable */
                is_variable = true;
                for(i = m_variables.state.length - 1; i >= 0; i--) {
                    if(m_variables.state[i].enable_by === parameter_name) {
                        m_variables.state.splice(i, 1);
                    };
                };
                if(parameter_value === "false" || parameter_value === "null") {
                    Swal.fire
                    (
                        "Disabled states",
                        "Disabled states enabled by " + parameter_name + "",
                        "info"
                    );
                    model_delete_parameter(component_id, parameter_name);
                } else if(state.type === "float") {
                    if(parameter_value > 0 && parameter_value <= 20) {
                        for(var i = 0; i < parameter_value; i++) {
                            var m_state = {};
                            m_state = {};
                            m_state["name"] = state.name + i;
                            m_state["enable_by"] = parameter_name;
                            m_state["type"] = "float";
                            component.variables.state.push(m_state);
                        };
                    } else {
                        Swal.fire
                        (
                            "Aborted",
                            "Please insert a valid number (see parameter description).",
                            "warning"
                        );
                    };
                };
            } else {
                component.parameters[parameter_name] = parameter_value;
            };
        });
    };
    if(is_variable === false) {
        component.parameters[parameter_name] = parameter_value;
    }
};

/***********************************************************************************************//**
 * Find the component from Model array and delete the element.
 * @param component_id
 * @param parameter_name
 **************************************************************************************************/
function model_delete_parameter(component_id, parameter_name)
{
    var component = components.find(x => x.id === component_id);

    delete component.parameters[parameter_name];
};

/***********************************************************************************************//**
 * Toggles visualization between comp_id name and input field, gets the inserted text and sets to
 * collapsible's comp_id field.
 **************************************************************************************************/
var alert_val = false; /* Used to check when alert shall be launched. */
function my_alert(alert_val)
{
    if(alert_val === true) {
        setTimeout(function()
        {
            Swal.fire
            (
                "Aborted",
                "Components cannot have the same name ID",
                "warning"
            )
        }, 100);
    }
};

$(".components_window_content").on("blur", ".input_comp_id", function()
{
    alert_val = false;
    var node_to_rename = $(this).parents().eq(1).attr("name");
    var current_id = $(this).parent().attr("name");
    var type = $(this).parents().eq(1).attr("type");
    var input_value = this.value.replace(/\s/g, "");
    var existing_comp_id = false;
    $(".comp_collapsible").children("p").each(function(i, comp)
    {
        var comp_name = $(comp).attr("name");
        if(comp_name === input_value) {
            existing_comp_id = true;
            alert_val = true;
        }
    });
    if($.trim(input_value) != '') {
        if(existing_comp_id === false) {
            $(this).prev().text(input_value);
            $(this).parent().attr("name", input_value);

            model_edit_component_id(current_id, input_value);
        } else {
            my_alert(alert_val);
        }
    } else {
        input_value = (this.defaultValue ? this.defaultValue : '');
    }

    $(this).hide();
    $(this).prev().show();
    if(alert_val === true) {
        $(this).val("");
    }
});

$(".components_window_content").on("keypress", ".input_comp_id", function(event)
{
    if(event.keyCode == "13") {
        $(this).blur();
    }
});

$(".components_window_content").on("click", ".btn_edit", function(event)
{
    event.stopPropagation();
    $(this).next().find("input").click(function (e)
    {
        e.stopPropagation();
    });

    $(this).next().find("span").hide();
    $(this).next().find("input").show();
    $(this).next().find("input").focus();
});

/***********************************************************************************************//**
 * Listen for contenteditable fields to be blurred and therefore, activate the blur event.
 **************************************************************************************************/
$(".components_window_content").on("keypress", "[contenteditable]", function(event)
{
    if(event.keyCode == "13") {
        $(this).blur();
    };
});

/***********************************************************************************************//**
 * Checks if parameter is already defined, if isn't creates it, if is, changes it.
 * Checks if contenteditable is empty and deletes the component if it was defined.
 **************************************************************************************************/
$(".components_window_content").on("blur", "[contenteditable]", function(event)
{
    const comp_current_id = $(this).parents().eq(3).prev().children("p").attr("name");
    const param_name = $(this).prev().attr("name");
    const param_value = $(this).text();
    var component = components.find(x => x.id === comp_current_id);
    var parameters = component.parameters;
    var existant_param_value = false;
    var existant_param = false;
    var empty_param = true;
    $.each(parameters, function(parameter_key, parameter)
    {
        if(parameter_key === param_name) {
            existant_param = true;
            if(parameter === param_value) {
                existant_param_value = true;
            }
        }
    });

    if($.trim(param_value) != "" && existant_param_value === false) {
        if(existant_param === false) {
            model_add_parameter(comp_current_id, param_name, param_value, $(this));
            empty_param = false;
        }else {
            model_change_parameter(comp_current_id, param_name, param_value);
        }
    }else {
        if($.trim(param_value) == "" && existant_param === true) {
            model_delete_variables(comp_current_id, param_name);
            model_delete_parameter(comp_current_id, param_name);
        }else if(existant_param === false){
            $(this).text("");
        }
    }
});

/***********************************************************************************************//**
 * Writes an internal JSON object (readability purposes), transforms Json object to yaml (yaml.dump)
 * And locally stores it.
 **************************************************************************************************/
function save_components()
{
    var yaml_components = {};
    $.each(components, function(components_key, component)
    {
        var m_component = {};
        m_component["parameters"] = {};
        m_component["class"] = component.type;
        $.each(component.parameters, function(parameter_key, parameter)
        {
            m_component.parameters[parameter_key] = parameter;
        });
        yaml_components[component.id] = m_component;
    });

    fs.writeFile(__dirname + "/yaml_configurations/components.yml", yaml.dump(yaml_components, {noRefs: true}), function(err)
    {
        if (err) {
            console.log(err);
        };
    });
};

module.exports =
{
    model_add_component,
    model_delete_component,
    model_edit_component_id,
    model_add_parameter,
    model_change_parameter,
    model_delete_variables
};

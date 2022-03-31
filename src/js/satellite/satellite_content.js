/***********************************************************************************************//**
 *  Back-end for the behaviour of satellite's window.
 *  @file      components.js
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
    url : "jsonFiles/satellite/configured_satellites.json",
    dataType : "json",
    success : function(satellites_file)
    {
        satellites_file = satellites_file;
        satellites_model = satellites_file.configured_satellites;
    }
});

/***********************************************************************************************//**
 *  @method load_sat_tree()
 *  Loads the satellite tree view every time user enters sat window by using the component's model.
 **************************************************************************************************/
function load_sat_tree()
{
    $.each(components, function(index, component)
    {
        var tree_component =
        {
            "id": component.id,
            "parent": "configured_components",
            "text": "" + component.type + "::" + component.id + ""
        };
        $.jstree.reference("#jstree_sat_comps").create_node("configured_components", tree_component);
        $.each(component.parameters, function(parameter_name, parameter_value)
        {
            var tree_parameter =
                {
                    "id": component.id + parameter_name,
                    "parent": component.id,
                    "text": "" + parameter_name + "::" + parameter_value + ""
                };
            $.jstree.reference("#jstree_sat_comps").create_node(component.id, tree_parameter);
        });
    });
};

/***********************************************************************************************//**
 *  @method empty_tree_sat()
 *  Empties the tree view to be prepared for a new load.
 **************************************************************************************************/
function empty_tree_sat()
{
    var parent = $("#jstree_sat_comps").jstree(true).get_node(configured_components);
    var children = $("#jstree_sat_comps").jstree(true).get_node(configured_components).children;
    $("#jstree_sat_comps").jstree(true).delete_node(children);
};

/***********************************************************************************************//**
 *  @method add_satellite
 *  Gets the information of the satellite id Input, and creates a new node on graph.
 *  @See https://sweetalert2.github.io/ for the alert management.
 **************************************************************************************************/
$(".btn_create_sat").click(function()
{
    var sat_id = $("#sat_id").val().replace(/\s/g, "");
    var existant_sat = false;

    for(var i = 0; i < satellites_model.length; i++) {
        if(satellites_model[i].id === sat_id) {
            existant_sat = true;
        };
    };

    if(sat_id.trim().length === 0) {
        Swal.fire(
            "Aborted",
            "Satellite name ID cannot be empty",
            "warning"
        );
    } else {
        if(graph._nodes.length === 0 && existant_sat === false) {
            var sat = LiteGraph.createNode("basic/default_node");
            sat.title = sat_id;
            sat.pos = [50, 50];
            graph.add(sat);
            modelsat_add_satellite(sat_id);
            jstree_add_satellite(sat_id);
        } else if(existant_sat === false) { /* Checks if there is already a sat node created */
            if(graph._nodes.length > 0) {
                Swal.fire(
                {
                    title: "Configure a new satellite?",
                    text: "The view will change to an empty configuration",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, configure new satellite!"
                }).then((result) =>
                {
                    /* Executes the following code if user clicks *Yes, delete it*. */
                    if (result.isConfirmed) {
                        var satellite_id;
                        for(i = 0; i < graph._nodes.length; i++) {
                            if(graph._nodes[i].type === "basic/default_node") {
                                satellite_id = graph._nodes[i].title;
                                break;
                            };
                        };
                        modelsat_save_graph(satellite_id);
                        graph.clear();

                        var sat = LiteGraph.createNode("basic/default_node");
                        sat.title = sat_id;
                        sat.pos = [50, 50];
                        graph.add(sat);
                        modelsat_add_satellite(sat_id);
                        jstree_add_satellite(sat_id);
                    };
                });
            };
        } else {
            Swal.fire(
                "Aborted",
                "Cannot create satellites with same id",
                "warning"
            );
        };
    };
});

/***********************************************************************************************//**
 *  @method custom_menu
 *  @param node to attach the custom_menu.
 *  Determines the options with right-click button on sat items.
 **************************************************************************************************/
function custom_menu(node) {
    var items = {
        configure_item:
        {
            label: "Configure",
            action: function()
            {
                Swal.fire(
                {
                    title: "Change visualization?",
                    text: "View will regraph with the seleced satellite",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, change visualization!"
                }).then((result) =>
                {
                    if (result.isConfirmed) {
                        var satellite_title;
                        for(var i = 0; i < graph._nodes.length; i++) {
                            if(graph._nodes[i].type === "basic/default_node") {
                                satellite_title = graph._nodes[i].title;
                            };
                        };
                        modelsat_save_graph(satellite_title);
                        graph.clear();

                        var selected_satellite = $.jstree.reference("#jstree_sat_list").get_selected(false);
                        satellite = satellites_model.find(x => x.id === selected_satellite[0]);
                        sat_graph = satellite.graph;
                        graph.configure(sat_graph);
                        update_graph_nodes(); /* Needed to remodel the nodes */
                    };
                });
            }
        },
        rename_item:
        {
            label: "Rename",
            action: function()
            {
                console.log("hello rename");
            }
        },
        delete_item:
        {
            label: "Delete",
            action: function()
            {
                Swal.fire(
                {
                    title: "Delete satellite?",
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
                        var selected_satellite = $.jstree.reference("#jstree_sat_list").get_selected(false);
                        for(var i = 0; i < satellites_model.length; i++) {
                            if(satellites_model[i].id === selected_satellite[0]) {
                                modelsat_delete_satellite(selected_satellite[0]);
                                jstree_delete_satellite(selected_satellite[0]);
                                if(search_sat_node() === selected_satellite[0]) {
                                    graph.clear();
                                }
                            }
                        }
                    }
                })
            }
        }
    };
    return items;
};

/***********************************************************************************************//**
 *  @method drop_node
 *  @See https://www.jstree.com/api/#/?q=dnd&f=dnd_stop.vakata
 *  Defines the event on drop node from tree-view.
 **************************************************************************************************/
$(document).on("dnd_stop.vakata", function (event, data)
{
    var node_dragged = data.data.origin.get_node(data.element);
    var node_name = node_dragged.text;
    var node_id = node_name.split("::").pop();
    var node_type = node_name.substr(0, node_name.indexOf("::"));
    var id_repeated_components = 0;
    var existant_id = false;
    var repeated_node_id;
    var component_unique_id;

    if(data.event.target.id === "sat_canvas") {
        var m_component = {};
        var m_satellite;
        var m_node_type;
        var m_node_id;
        var m_node_unique_id;

        /* Checks if a sat is defined */
        if(graph._nodes.length > 0) {
                $.each(components, function(component_index, component)
                {
                    if(component.id === node_dragged.id) {
                        m_component = component;
                        component_unique_id = component.unique_id;
                    };
                });
                $.each(graph._nodes, function(index_node, node)
                {
                    m_node_id = node.title.split("::").pop();
                    m_node_unique_id = m_node_id.substr(0, m_node_id.lastIndexOf("_"));
                    if(node.type === "basic/default_node") {
                        m_satellite = node.title;
                    } else if(m_node_unique_id === node_id) {
                        existant_id = true;
                        repeated_node_id = m_node_id;
                    };
                });
                if(existant_id === true) {
                    var last_found = false;
                    id_repeated_components = repeated_node_id.split("_").pop(); /* number of repeated comp */
                    id_repeated_components++;

                    while(last_found === false)
                    {
                        var existant_rep = graph._nodes.find(x => x.title.split("::").pop() === m_node_unique_id + "_" + id_repeated_components);

                        if(existant_rep === undefined) {
                            last_found = true;
                        } else {
                            id_repeated_components++;
                        };
                    };
                };

            /***********************************************************************************************//**
             *  @method LiteGraph.registerNodeType
             *  @See https://github.com/jagenjo/litegraph.js?files=1
             *  Registers a new node to the graph by using anonymous function.
             **************************************************************************************************/
            LiteGraph.registerNodeType("basic/" + node_id + "", function()
            {
                const m_this = this;

                $.each(m_component.variables.in, function(input_index, input)
                {
                    m_this.addInput(input.name + "::" + input.type, input.type);
                });

                $.each(m_component.variables.out, function(output_index, output)
                {
                    m_this.addOutput(output.name + "::" + output.type, output.type);
                });

                $.each(m_component.variables.state, function(state_index, state)
                {
                    m_this.addWidget("text","" + state.name + "::" + state.type + "", "state");
                });
                this.properties = {unique_id: component_unique_id};
                this.title = node_name + "_" + id_repeated_components;
            });
            var drop_component = LiteGraph.createNode("basic/" + node_id + "");
            drop_component.pos = [150,150];
            graph.add(drop_component);
        } else {
            Swal.fire
            (
                "Aborted!",
                "Please create a new satellite or load existant one.",
                "warning"
            );
        };
    } else {
        Swal.fire
        (
            "Failed!",
            "Please be sure to drop into graph zone.",
            "warning"
        );
    };
});

/***********************************************************************************************//**
 *  @method modelsat_add_satellite
 *  @param sat_id
 *  Gets the id of the created satellite and pushes a default sat object to sat's model.
 **************************************************************************************************/
function modelsat_add_satellite(sat_id)
{
    var satellite = {};
    satellite["id"] = sat_id;
    satellite["models"] = [];
    satellite["links"] = [];
    satellite["devices"] = [];
    satellite["stack"] = [];
    satellite["graph"] = {};

    satellites_model.push(satellite);
};

/***********************************************************************************************//**
 *  @method modelsat_save_graph
 *  @param satellite_id
 *  Save the satellite's graph current configuration
 **************************************************************************************************/
function modelsat_save_graph(satellite_id)
{
    if(graph._nodes.length > 0) {
        satellite = satellites_model.find(x => x.id === satellite_id);
        var m_graph;
        m_graph = graph.serialize();
        satellite["graph"] = m_graph;
        modelsat_save_models(satellite);
    };
};
/***********************************************************************************************//**
 *  @method jstree_add_satellite
 *  @param sat_id
 *  Gets the id of the created satellite and introduces to sat list tree view
 **************************************************************************************************/
function jstree_add_satellite(sat_id)
{
    var tree_satellite =
    {
        "id": sat_id,
        "parent": "configured_satellites",
        "text": sat_id
    };
    $.jstree.reference("#jstree_sat_list").create_node("configured_satellites", tree_satellite);
};

/***********************************************************************************************//**
 *  @method modelsat_add_component
 *  @param satellite_id
 *  @param component
 *  Gets the id of the configured satellite and introduces the component. MODELS in our case
 **************************************************************************************************/
function modelsat_add_component(satellite_id, component)
{
    var model_id = component.split("::").pop();
    var model_unique_id = model_id.substr(0, model_id.lastIndexOf("_"));
    var found = false;

    if(satellite_id.constructor === Array) {
        satellite_id = satellite_id[0];
    };
    var satellite = satellites_model.find(x => x.id === satellite_id);
    var m_component = {};

    m_component["type"] = model_unique_id;
    m_component["id"] = model_id;
    for(var i = 0; i < satellite.models.length; i++) {
        if(satellite.models[i].id === model_id) {
            found = true;
        };
    };
    if(found === false) {
        satellite.models.push(m_component);
    };
};

/***********************************************************************************************//**
 *  @method model_rename_satellite
 *  Gets the id of the created satellite and renames it.
 **************************************************************************************************/
/* TODO */

/***********************************************************************************************//**
 *  @method jstree_rename_satellite
 *  Gets the id of the created satellite and introduces to sat list tree view
 **************************************************************************************************/
/* TODO */


/***********************************************************************************************//**
 *  @method modelsat_delete_satellite
 *  @param satellite_id
 *  Deletes the object that matches with satellite_id
 **************************************************************************************************/
function modelsat_delete_satellite(satellite_id)
{
    for(var i = 0; i < satellites_model.length; i++) {
        if(satellites_model[i].id === satellite_id) {
            satellites_model.splice(i, 1);
            break;
        };
    };
};

/***********************************************************************************************//**
 *  @method jstree_delete_satellite
 *  @param satellite_id
 *  Deletes the node that matches with satellite_id
 **************************************************************************************************/
function jstree_delete_satellite(satellite_id)
{
    $.jstree.reference("#jstree_sat_list").delete_node(satellite_id);
};

/***********************************************************************************************//**
 *  @method search_sat_node
 *  Search the node that corresponds to satellite default box.
 **************************************************************************************************/
function search_sat_node()
{
    if(graph._nodes.length > 0) {
        var satellite_node;
        $.each(graph._nodes, function(node_index, node)
        {
            if(node.type === "basic/default_node") {
                satellite_node = node.title;
            };
        });
        if(satellite_node.constructor === Array) {
            satellite_node = satellite_node[0];
        };

        return satellite_node;
    };
};

/***********************************************************************************************//**
 *  @method update_graph_models
 *  Triggered when user returns to satellite view. Compares sat's model object with the graphs
 *  current configurations and updates them.
 **************************************************************************************************/
function update_graph_models()
{
    $.each(satellites_model, function(sat_index, sat)
    {
        var satellite_title;
        for(var i = 0; i < graph._nodes.length; i++) {
            if(graph._nodes[i].type === "basic/default_node") {
                satellite_title = graph._nodes[i].title;
            };
        };
        modelsat_save_graph(satellite_title);
        graph.clear();

        satellite = satellites_model.find(x => x.id === sat.id);
        sat_graph = satellite.graph;
        graph.configure(sat_graph);
        update_graph_nodes();
    });
};

/***********************************************************************************************//**
 *  @method update_graph_nodes
 *  Checks if any used component model is changed.
 **************************************************************************************************/
function update_graph_nodes()
{
    if(graph._nodes.length > 0) {
        var nodes_to_remove = [];
        var satellite_id;

        $.each(graph._nodes, function(index_node, node)
        {
            if(node !== undefined && node.type !== "basic/default_node") {
                var node_id = node.title.split("::").pop();
                var node_unique_id = node_id.substr(0, node_id.lastIndexOf("_"));
                var found = false;

                $.each(components, function(index_component, component)
                {
                    if(component.unique_id === node.properties.unique_id) {
                        found = true;
                    };
                });
                if(found !== true) {
                    nodes_to_remove.push(index_node);
                } else {
                    update_graph_model(node);
                };
            } else if(node.type === "basic/defualt_node") {
                satellite_id = node.id;
            };
        });
        for(var i = nodes_to_remove.length - 1; i >= 0; i--) {
            graph.remove(graph._nodes[nodes_to_remove[i]]);
        };
    };
};

/***********************************************************************************************//**
 *  @method update_graph_model
 *  @param node
 *  Get the number of variables from component's model, and change the node information if changed.
 **************************************************************************************************/
function update_graph_model(node)
{
    var component_is_found = false;
    var component;
    var node_id = node.title.split("::").pop();
    var node_unique_id = node_id.substr(0, node_id.lastIndexOf("_"));

    $.each(components, function(index_component, m_component)
    {

        if(m_component.unique_id === node.properties.unique_id) {
            component = m_component;
            component_is_found = true;
        };
    });

    if(node_unique_id !== component.id && component_is_found === true) {
        $.each(graph._nodes, function(m_index_node, m_node)
        {
            m_node_id = m_node.title.split("::").pop();
            m_node_unique_id = m_node_id.substr(0, m_node_id.lastIndexOf("_"));

            if(m_node_unique_id === node_unique_id) {
                replaced_title = node.title.replace(node_unique_id, component.id);
                node.title = replaced_title;
            };
        });
    };

    if(component !== undefined) {
        if(node.inputs !== undefined) {
            if(component.variables.in.length <= node.inputs.length) {
                var to_remove = [];

                $.each(node.inputs, function(index_input, input)
                {
                    var input_name;

                    if(input.name.includes("::")) {
                        input_name = node.inputs[index_input].name.substr(0, node.inputs[index_input].name.lastIndexOf("::"));
                    } else {
                        input_name = node.inputs[index_input].name;
                    };

                    if(index_input >= component.variables.in.length) {
                        to_remove.push(index_input);
                    } else {
                        if(input_name === component.variables.in[index_input].name) {
                        } else {
                            const component_input = component.variables.in[index_input];
                            to_remove.push(index_input);
                            node.addInput(component_input.name + "::" + component_input.type, component_input.type);
                        };
                    };
                });
                for(var i = to_remove.length - 1; i >= 0; i--) {
                    node.removeInput(to_remove[i]);
                };
            } else {
                var to_remove = [];
                const input_length = node.inputs.length;
                $.each(component.variables.in, function(index_input, input)
                {
                    var node_input_name;
                    if(index_input < input_length) {
                        if(node.inputs[index_input].name.includes("::")) {
                            node_input_name = node.inputs[index_input].name.substr(0, node.inputs[index_input].name.lastIndexOf("::"));
                        } else {
                            node_input_name = node.inputs[index_input].name;
                        };
                        if(node_input_name === input.name) {
                        } else {
                            to_remove.push(index_input);
                            node.addInput(input.name + "::" + input.type, input.type);
                        };
                    } else {
                        node.addInput(input.name + "::" + input.type, input.type);
                    };
                });
                for(var i = to_remove.length - 1; i >= 0; i--) {
                    node.removeInput(to_remove[i]);
                };
            };
        } else if(component.variables.in.length > 0) {
            $.each(component.variables.in, function(index_input, input)
            {
                node.addInput(input.name + "::" + input.type, input.type);
            });
        };

        if(node.outputs !== undefined) {
            if(component.variables.out.length <= node.outputs.length) {
                var to_remove = [];

                $.each(node.outputs, function(index_output, output)
                {
                    var output_name;

                    if(output.name.includes("::")) {
                        output_name = node.outputs[index_output].name.substr(0, node.outputs[index_output].name.lastIndexOf("::"));
                    } else {
                        output_name = node.outputs[index_output].name;
                    };

                    if(index_output >= component.variables.out.length) {
                        to_remove.push(index_output);
                    } else {
                        if(output_name === component.variables.out[index_output].name) {
                        } else {
                            const component_output = component.variables.out[index_output];
                            to_remove.push(index_output);
                            node.addOutput(component_output.name + "::" + component_output.type, component_output.type);
                        };
                    };
                });
                for(var i = to_remove.length - 1; i >= 0; i--) {
                    node.removeOutput(to_remove[i]);
                };
            } else {
                var to_remove = [];
                const output_length = node.outputs.length;
                $.each(component.variables.out, function(index_output, output)
                {
                    var node_output_name;
                    if(index_output < output_length) {
                        if(node.outputs[index_output].name.includes("::")) {
                            node_output_name = node.outputs[index_output].name.substr(0, node.outputs[index_output].name.lastIndexOf("::"));
                        } else {
                            node_output_name = node.outputs[index_output].name;
                        };
                        if(node_output_name === output.name) {
                        } else {
                            to_remove.push(index_output);
                            node.addOutput(output.name + "::" + output.type, output.type);
                        };
                    } else {
                        node.addOutput(output.name + "::" + output.type, output.type);
                    };
                });
                for(var i = to_remove.length - 1; i >= 0; i--) {
                    node.removeOutput(to_remove[i]);
                };
            };
        } else if(component.variables.out.length > 0) {
            $.each(component.variables.out, function(index_output, output)
            {
                node.addOutput(output.name + "::" + output.type, output.type);
            });
        };
        /* Temporary */
        if(node.widgets !== undefined) {
        };
    };
};

/***********************************************************************************************//**
 *  @method modelsat_save_models
 *  @param satellite object from sat's model array
 *  Get the current satellite's graph configuration and updates satellites_model
 **************************************************************************************************/
function modelsat_save_models(satellite)
{
    var m_satellite = {};
    m_satellite["models"] = [];
    m_satellite["links"] = [];
    m_satellite["devices"] = [];
    m_satellite["stack"] = [];

    modelsat_delete_models(satellite);
    modelsat_delete_links(satellite);

    $.each(satellite.graph.nodes, function(node_index, node)
    {
        if(node.type !== "basic/default_node") {
            modelsat_add_component(satellite.id, node.title);
        };
    });
    $.each(satellite.models, function(model_key, model)
    {
        m_satellite.models.push(model);
    });


    $.each(satellite.graph.links, function(link_index, link)
    {
        var graph = satellite.graph;
        var m_link = {};
        var slot_out = graph.nodes.find(x => x.id === link[1]).outputs[link[2]].name;
        var slot_in = graph.nodes.find(x => x.id === link[3]).inputs[link[4]].name;
        var component_out = graph.nodes.find(x => x.id === link[1]).title;
        var component_in = graph.nodes.find(x => x.id === link[3]).title;

        m_link["out"] = component_out.split('::').pop() + "." + slot_out.substr(0, slot_out.indexOf('::'));
        m_link["in"] = component_in.split('::').pop() + "." + slot_in.substr(0, slot_in.indexOf('::'));
        satellite.links.push(m_link);
    });
    $.each(satellite.links, function(link_key, link)
    {
        m_satellite.links.push(link);
    });

    return m_satellite;
}

/***********************************************************************************************//**
 *  @method modelsat_delete_models
 *  @param satellite object from sat's model array
 *  Empties the model object from specified satellite
 **************************************************************************************************/
function modelsat_delete_models(satellite)
{
    for(var i = satellite.models.length - 1; i >= 0 ; i--) {
        satellite.models.splice(i, 1);
    };
};

/***********************************************************************************************//**
 *  @method modelsat_delete_links
 *  @param satellite object
 *  Empties the links object from specified satellite
 **************************************************************************************************/
function modelsat_delete_links(satellite)
{
    for(var i = satellite.links.length - 1; i >= 0 ; i--) {
        satellite.links.splice(i, 1);
    };
};

/***********************************************************************************************//**
 *  @method save_satellites
 *  Gets the current modelsat information and stores into YAML file
 **************************************************************************************************/
function save_satellites()
{
    var yaml_satellites = {};

    $.each(satellites_model, function(satellite_key, satellite)
    {
        yaml_satellites[satellite.id] = modelsat_save_models(satellite);
    });

    fs.writeFile(__dirname + "/yaml_configurations/satellites.yml", yaml.dump(yaml_satellites, {noRefs: true}), function(err)
    {
        if(err) {
            console.log(err);
        };
    });
};

/* Exporting modules for testing */
module.exports =
{
    modelsat_add_satellite,
    modelsat_add_component,
    modelsat_delete_links,
    modelsat_save_models,
    modelsat_delete_models,
    modelsat_delete_satellite
};

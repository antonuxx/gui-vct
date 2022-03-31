/***********************************************************************************************//**
 *  Definition of the graph and canvas using litegraph.js
 *  @file       lgrpah.js
 *  @author     Anton Villalonga, antonuxx@gmail.com
 *  @date       2020-nov-20
 *  @copyright  This file is part of a project developed at Nano-Satellite and Payload Laboratory
 *              (NanoSat Lab), Universitat Politècnica de Catalunya - UPC BarcelonaTech.
 **************************************************************************************************/

/***********************************************************************************************//**
 *  Creates a new LGraph() and sets a new LGraphCanvas()
 *  @See LiteGraph
 *  @param autoresize is set as desktop application is resizable.
 *  @param render_canvas_border is set to false because autoresize continuously change the borders.
 *  @param background_image is changed from litegraph.js default to white squared.
 **************************************************************************************************/
var graph = new LGraph();

/***********************************************************************************************//**
 *  @method getCanvasMenuOptions
 *  @litegraph override: Remove the default context menu.
 **************************************************************************************************/
var canvas = new LGraphCanvas("#sat_canvas", graph, {autoresize: true});
canvas.getCanvasMenuOptions = function()
{
    var options = null;
    return options;
};

/***********************************************************************************************//**
 *  @method getNodeMenuOptions
 *  @litegraph override: Remove all the options by default except the ones used.
 *  @param node to attach the context menu
 **************************************************************************************************/
canvas.getNodeMenuOptions = function(node)
{
    var options = null;

    if(node.getMenuOptions) {
        options = node.getMenuOptions(this);
    } else {
        options = [
            {
                content: "Collapse",
                callback: LGraphCanvas.onMenuNodeCollapse
            },
            {
                content: "Colors",
                has_submenu: true,
                callback: LGraphCanvas.onMenuNodeColors
            },
            {
                content: "Shapes",
                has_submenu: true,
                callback: LGraphCanvas.onMenuNodeShapes
            },
        ];
    }

    if (node.getExtraMenuOptions) {
        var extra = node.getExtraMenuOptions(this, options);
        if (extra) {
            extra.push(null);
            options = extra.concat(options);
        }
    }

    if(0) //TODO
    options.push({
        content: "To Subgraph",
        callback: LGraphCanvas.onMenuNodeToSubgraph
    });

    if(node.type !== "basic/default_node") { /* Satellite can be removed via tree-view */
        options.push(null, {
            content: "Remove",
            disabled: !(node.removable !== false && !node.block_delete ),
            callback: LGraphCanvas.onMenuNodeRemove
        });
    };

    if (node.graph && node.graph.onGetNodeMenuOptions) {
        node.graph.onGetNodeMenuOptions(options, node);
    }

    return options;
};

/***********************************************************************************************//**
 *  @method render_canvas_border
 *  @litegraph override: Remove the default border of the graph
 **************************************************************************************************/
canvas.render_canvas_border = false;

/***********************************************************************************************//**
 *  @method background_image
 *  @litegraph override: Changes the base grid image for a white box.
 **************************************************************************************************/
var background_image = "data:image/png;base64,"; /* base64 for white square */
background_image += "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAQAAADa613fAAAAaUlEQVR42u3PQREAAAgDINc/9Izg34MGpJ0XIiIiIiIiI";
background_image += "iIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIi";
background_image += "JyWYprx532021aAAAAAElFTkSuQmCC";
canvas.background_image = background_image; /* Change the default grid to white background */

graph.start();

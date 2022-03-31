/***********************************************************************************************//**
 *  Defines the jstree object to be used in component's window
 *  @file       components_jstree.js
 *  @author     Anton Villalonga, antonuxx@gmail.com
 *  @date       2020-nov-20
 *  @copyright  This file is part of a project developed at Nano-Satellite and Payload Laboratory
 *              (NanoSat Lab), Universitat Politècnica de Catalunya - UPC BarcelonaTech.
 **************************************************************************************************/

/***********************************************************************************************//**
 *  Tree-view definition for the components window.
 *  *JSTREE* library gets the div to reference a new tree structure.
 *  @See https://www.jstree.com/
 *  @param jstree_components    Div id from index.html.
 **************************************************************************************************/
$(function ()
{
    $("#jstree_components").jstree(
    {
        core: /* Define data structure and optional settings, as check_callback. */
        {
            data:
            [
                {
                    id: "components",
                    parent: "#", /* Root node */
                    text: "components",
                    state:
                    {
                        opened: true /* First child family opened */
                    }
                },
            ],
            check_callback: true /* False by default, set this to true to allow all interactions  */
        }
    });
});

/***********************************************************************************************//**
 * Populates the component's tree view, based on the information at physical_components.json
 * Timeout is set as a TEMPORARY solution, as it doesn't work with $(document).ready()
 **************************************************************************************************/
setTimeout(function()
{
    $(physical_components).each(function(comp_key, comp)
    {
        var component =
            {
                "id" : comp.type,
                "parent" : "components",
                "text" : comp.type
            };
        $.jstree.reference("#jstree_components").create_node("components", component);

        $.each(comp.parameters, function(param_key, param)
        {
            console.log(param_key);
            var comp_param =
                {
                    "id" : param_key + comp_key,
                    "parent" : comp.type,
                    "text" : param_key
                };
            $.jstree.reference("#jstree_components").create_node(comp.type, comp_param);
        });
    });
}, 4000);

/***********************************************************************************************//**
 *  Defines the jstree object to be used in satellite's window
 *  @file       satellite_jstree.js
 *  @author     Anton Villalonga, antonuxx@gmail.com
 *  @date       2020-nov-20
 *  @copyright  This file is part of a project developed at Nano-Satellite and Payload Laboratory
 *              (NanoSat Lab), Universitat Politècnica de Catalunya - UPC BarcelonaTech.
 **************************************************************************************************/

/***********************************************************************************************//**
 *  Defines the jstree_sat_comps container content.
 **************************************************************************************************/
/* Components list */
$(function ()
{
    $("#jstree_sat_comps").jstree(
    {
        core:
        {
            data:
            [
                {
                    id: "configured_components",
                    parent: "#",
                    text: "configured_components",
                    state:
                    {
                        opened: true
                    }
                },
            ],
        check_callback : true
        },
    plugins: ["dnd"] /* Plug in to activate drag and drop feature */
    });

    /* satellite list */
    $("#jstree_sat_list").jstree(
    {
        core:
        {
            data:
            [
                {
                    id: "configured_satellites",
                    parent: "#",
                    text: "configured_satellites",
                    state:
                    {
                        opened: true
                    }
                },
            ],
        check_callback : true
        },
    plugins: ["contextmenu"],
    contextmenu: {items: custom_menu} /* Options defined in satellite_content.js */
    });
});

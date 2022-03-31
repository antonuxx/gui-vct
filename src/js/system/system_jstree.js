/***********************************************************************************************//**
 *  Defines the jstree object to be used in system's window
 *  @file       system_jstree.js
 *  @author     Anton Villalonga, antonuxx@gmail.com
 *  @date       2020-nov-20
 *  @copyright  This file is part of a project developed at Nano-Satellite and Payload Laboratory
 *              (NanoSat Lab), Universitat Politècnica de Catalunya - UPC BarcelonaTech.
 **************************************************************************************************/

/***********************************************************************************************//**
 *  Defines the jstree_sat_comps container content.
 **************************************************************************************************/
$(function ()
{
    $("#jstree_system").jstree(
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
        }
    });
});

/***********************************************************************************************//**
*  Back-end for components's network behaviour.
*  @file       network.js
*  @author     Anton Villalonga, antonuxx@gmail.com
*  @date       2020-nov-20
*  @copyright  This file is part of a project developed at Nano-Satellite and Payload Laboratory
*              (NanoSat Lab), Universitat Politècnica de Catalunya - UPC BarcelonaTech.
**************************************************************************************************/

/***********************************************************************************************//**
*  Tree-view definition for the network window.
**************************************************************************************************/
$(function () {
    $('#jstree_network').jstree(
    {
        "core" :
        {
            "data" :
            [
                "simple root node 2",
                {
                    "text" : "Root node 2",
                    "state" :
                    {
                        "opened" : true,
                        "selected" : true
                    },
                    "children" :
                    [
                        {
                            "text" : "Child 1"
                        },
                        "child 2"
                    ]
                }
            ]
        },
        "plugins" : ["checkbox"]
    });
 });

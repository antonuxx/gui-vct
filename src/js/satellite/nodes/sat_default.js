/***********************************************************************************************//**
 *  Defines the default satellite node for each LiteGraph.
 *  @file       sat_default.js
 *  @author     Anton Villalonga, antonuxx@gmail.com
 *  @date       2020-nov-20
 *  @copyright  This file is part of a project developed at Nano-Satellite and Payload Laboratory
 *              (NanoSat Lab), Universitat Politècnica de Catalunya - UPC BarcelonaTech.
 **************************************************************************************************/

/***********************************************************************************************//**
 *  Creates a satellite node and registers it.
 *  @See Litegraph.js
 *  Temporary, as stack and Device shall be changed in the future.
 **************************************************************************************************/
function default_node()
{
    this.addWidget("combo","Device", "prot1", function(){}, { values:["prot1","prot2","prot3"] } );
    this.slider_widget = this.addWidget("number","Stack", 5, { min: 0, max: 10} );
};

LiteGraph.registerNodeType("basic/default_node", default_node);

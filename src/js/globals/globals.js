/***********************************************************************************************//**
 *  Back-end for globals's window behaviour.
 *  @file       globals.js
 *  @author     Anton Villalonga, antonuxx@gmail.com
 *  @date       2020-nov-20
 *  @copyright  This file is part of a project developed at Nano-Satellite and Payload Laboratory
 *              (NanoSat Lab), Universitat Politècnica de Catalunya - UPC BarcelonaTech.
 **************************************************************************************************/

const yaml = require('js-yaml');
/***********************************************************************************************//**
 *  Saves the current configuration into JSON models.
 **************************************************************************************************/
$('#save_configuration').click(function ()
{
    save_components();
    save_satellites();
    save_systems();
    Swal.fire(
    {
        position: "top-end",
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: false,
        timer: 1500
    });
});

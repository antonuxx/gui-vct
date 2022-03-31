/***********************************************************************************************//**
 *  Add addEventListeners for each tab and toggles the contents of sidebar and pane.
 *  @file      tabs.js
 *  @author     Anton Villalonga, antonuxx@gmail.com
 *  @date       2020-nov-20
 *  @copyright  This file is part of a project developed at Nano-Satellite and Payload Laboratory
 *              (NanoSat Lab), Universitat Politècnica de Catalunya - UPC BarcelonaTech.
 **************************************************************************************************/

const tabs = document.querySelectorAll('[data-tab-target]');
const tab_contents = document.querySelectorAll('[data-tab-content]');
const sidebar_contents = document.querySelectorAll('[sidebar_contents]');

/***********************************************************************************************//**
 * Listen to event click for each tab, once clicked, sets the active class.
 **************************************************************************************************/
tabs.forEach(tab =>
{
    tab.addEventListener("click", () =>
    {
        const target = document.querySelector(tab.dataset.tabTarget);
        tab_contents.forEach(tab_content =>
        {
            tab_content.classList.remove("active");
        });
        tabs.forEach(tab =>
        {
        tab.classList.remove("active");
        });
        tab.classList.add("active");
        target.classList.add("active");
    });
});

/***********************************************************************************************//**
 * Get the id of the current tab selection, and displays it's jstree
 **************************************************************************************************/
function sidebar_content_comps()
{
    let sidebarTarget = document.getElementById("jstree_components");

    if (sidebarTarget.style.display === "block") {
    } else {
        sidebar_contents.forEach(sidebar_content =>
        {
            sidebar_content.style.display = "none";
        });
        sidebarTarget.style.display = "block";
    };

    empty_tree_sat(); /* Empties satellite tree view once view is changed. */
    empty_tree_system();
    empty_sat_types();

    if(graph._nodes.length > 0) {
        update_graph_models();
        modelsat_save_graph(search_sat_node());
    };
};

function sidebar_content_net()
{
    let sidebarTarget = document.getElementById("jstree_network");

    if (sidebarTarget.style.display === "block") {
    } else {
        sidebar_contents.forEach(sidebar_content =>
        {
            sidebar_content.style.display = "none";
        });
        sidebarTarget.style.display = "block";
    };

    empty_tree_sat();
    empty_tree_system();
    empty_sat_types();
};

function sidebar_content_sat()
{
    let sidebarTarget = document.getElementById("jstree_sat");

    if (sidebarTarget.style.display === "block") {
    } else {
        load_sat_tree();
        update_graph_nodes();
        sidebar_contents.forEach(sidebar_content => {
            sidebar_content.style.display = "none";
        });
        sidebarTarget.style.display = "block";
    };

    empty_tree_system();
    empty_sat_types();
}

function sidebar_content_sys()
{
    let sidebarTarget = document.getElementById("jstree_system");

    if (sidebarTarget.style.display === "block") {
    } else {
        sidebar_contents.forEach(sidebar_content =>
        {
            sidebar_content.style.display = "none";
        });
        sidebarTarget.style.display = "block";

        empty_tree_sat();
        if(graph._nodes.length > 0) {
            update_graph_models();
            modelsat_save_graph(search_sat_node());
        };
        load_system_tree();
        load_sat_types();
        if(systems_model.length > 0) {
            update_systems();
        };
    };
};


function sidebar_content_globals()
{
    let sidebarTarget = document.getElementById("jstree_globals");

    if (sidebarTarget.style.display === "block") {
    } else {
      sidebar_contents.forEach(sidebar_content => {
          sidebar_content.style.display = "none";
      });
      sidebarTarget.style.display = "block";
    }

    empty_tree_sat();
    empty_tree_system();
    empty_sat_types();
    update_graph_models();
    update_systems();
    if (satellites_model.length > 0) {
        modelsat_save_graph(search_sat_node());
    };
};

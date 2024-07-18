import { supabase } from "./initSupabase.js";


export const CsvTables = (options) => {
    options = options || {};
    var csv_path = options.csv_path || "";
    var el = options.element || "table-container";
    var allow_download = options.allow_download || false;
    var csv_options = options.csv_options || {};
    var datatables_options = options.datatables_options || {};
    var custom_formatting = options.custom_formatting || [];
    var customTemplates = {};
    $.each(custom_formatting, function (i, v) {
        var colIdx = v[0];
        var func = v[1];
        customTemplates[colIdx] = func;
    });



    var $table = $("<table class='display' id='" + el + "-table'></table>");
    var $containerElement = $("#" + el);
    $containerElement.empty().append($table);

    // trigger the search button when user presses the html button



    $.when($.get(csv_path)).then(
        function (data) {
            var csvData = $.csv.toArrays(data, csv_options);
            var $tableHead = $("<thead></thead>");
            var csvHeaderRow = csvData[0];
            var $tableHeadRow = $("<tr></tr>");
            for (var headerIdx = 0; headerIdx < csvHeaderRow.length; headerIdx++) {
                $tableHeadRow.append($("<th></th>").text(csvHeaderRow[headerIdx]));
            }
            $tableHead.append($tableHeadRow);

            $table.append($tableHead);
            var $tableBody = $("<tbody></tbody>");

            for (var rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
                var $tableBodyRow = $("<tr></tr>");
                for (var colIdx = 0; colIdx < csvData[rowIdx].length; colIdx++) {
                    var $tableBodyRowTd = $("<td></td>");
                    var cellTemplateFunc = customTemplates[colIdx];
                    if (cellTemplateFunc) {
                        $tableBodyRowTd.html(cellTemplateFunc(csvData[rowIdx][colIdx]));
                    } else {
                        $tableBodyRowTd.text(csvData[rowIdx][colIdx]);
                    }
                    $tableBodyRow.append($tableBodyRowTd);
                    $tableBody.append($tableBodyRow);
                }
            }
            $table.append($tableBody);

            $table.DataTable(datatables_options);

            $('#pppkSearch').on('click', function () {
                // Perform search. Replace 'Your Search Term' with the actual search term.
                $table.DataTable().search('PPPK').draw();
            });

            $('#asnSearch').on('click', function () {
                // Perform search. Replace 'Your Search Term' with the actual search term.
                $table.DataTable().search('PNS').draw();
            });

            $('#honorerSearch').on('click', function () {
                // Perform search. Replace 'Your Search Term' with the actual search term.
                $table.DataTable().search('Honor Sekolah').draw();
            });

            async function checkUserLoggedIn() {
                const { data: user, error } = await supabase.auth.getUser();
                return !!user.user;
            }

            // Call the function and append the button only if the user is logged in
            checkUserLoggedIn().then(isLoggedIn => {
                if (isLoggedIn) {
                    $containerElement.append("<p><button id='uploadBtn' class='button button-primary mb-4'>Upload Data Baru</button></p>");

                    // Add click event listener to the 'Upload Data Baru' button here if needed
                }
            });

            // jQuery to trigger the file input click event when the new button is clicked
            $("#uploadBtn").click(function () {
                $("#fileInput").click();
            });

            $("#fileInput").change(async function (e) {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    //adjust the filename to include timestamp
                    const d = new Date();
                    const timestamp = d.getTime();
                    const filePath = `uploaded/${timestamp}-${file.name}`;

                    try {
                        const { data, error } = await supabase.storage.from('simpkt-csv').upload(filePath, file);

                        if (error) {
                            throw error;
                        }

                        // alert the user of a successful upload
                        alert("File uploaded successfully. Click 'Download Data' to view the updated data.");

                        //reload the page to show the updated data
                        location.reload();




                        // Optionally, display the uploaded file or its URL to the user
                    } catch (error) {
                        console.error('Error uploading file:', error.message);
                    }
                }
            });

            if (allow_download) {
                $containerElement.append("<p><a class='button button-primary' href='" + csv_path + "'><i class='glyphicon glyphicon-download'></i> Download Data</a></p>");
            }
        });

}
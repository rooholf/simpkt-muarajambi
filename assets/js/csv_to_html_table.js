import { supabase } from './initSupabase.js';


var CsvToHtmlTable = CsvToHtmlTable || {};

CsvToHtmlTable = {
    init: function (options) {
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

                // Keep the file input but hide it for styling purposes
                $containerElement.append("<p style='display:none;'><input type='file' id='fileInput' name='fileInput'></p>");

                // Add a styled button that when clicked, triggers the hidden file input's click event
                $containerElement.append("<p><button id='uploadBtn' class='button button-primary mb-4'>Upload Data Baru</button></p>");

                // jQuery to trigger the file input click event when the new button is clicked
                $("#uploadBtn").click(function () {
                    $("#fileInput").click();
                });

                $("#fileInput").change(async function (e) {
                    if (e.target.files.length > 0) {
                        const file = e.target.files[0];
                        const filePath = `uploads/${file.name}`;

                        try {
                            const { data, error } = await supabase.storage.from('simpkt-csv').upload(filePath, file);

                            if (error) {
                                throw error;
                            }

                            console.log('File uploaded successfully:', data);
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
};

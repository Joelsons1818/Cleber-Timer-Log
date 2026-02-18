// Google Apps Script para Clever Timer
// Copie este código para o editor de script da sua planilha

function doGet(e) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Pega todos os dados da planilha
    const data = sheet.getDataRange().getValues();

    // Se estiver vazia, retorna array vazio
    if (data.length <= 1) { // Considerando que a linha 1 é cabeçalho
        return ContentService.createTextOutput(JSON.stringify([]))
            .setMimeType(ContentService.MimeType.JSON);
    }

    // Converte linhas em objetos JSON
    const headers = data[0];
    const logs = [];

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const log = {};
        // Mapeia colunas baseadas no índice
        // Ordem esperada: ID, Date, Water, Coffee, Temp, Name, Grind, Notes
        log.id = row[0];
        log.date = row[1];
        log.water = row[2];
        log.coffee = row[3];
        log.temp = row[4];
        log.coffeeName = row[5];
        log.grind = row[6];
        log.notes = row[7];
        logs.push(log);
    }

    return ContentService.createTextOutput(JSON.stringify(logs))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        // Verifica se precisa criar cabeçalho
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(["ID", "Date", "Water", "Coffee", "Temp", "CoffeeName", "Grind", "Notes"]);
        }

        const body = JSON.parse(e.postData.contents);

        // --- LOGICA DE DELETAR ---
        if (body.action === 'delete') {
            const idToDelete = body.id;
            const data = sheet.getDataRange().getValues();
            // Procura a linha com o ID correspondente (ignorando cabeçalho)
            for (let i = 1; i < data.length; i++) {
                if (data[i][0] == idToDelete) {
                    // Deleta a linha (i + 1 porque a planilha é 1-indexed)
                    sheet.deleteRow(i + 1);
                    return ContentService.createTextOutput(JSON.stringify({ success: true, deleted: idToDelete }))
                        .setMimeType(ContentService.MimeType.JSON);
                }
            }
            return ContentService.createTextOutput(JSON.stringify({ error: 'ID not found' }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // --- LOGICA DE SALVAR (PADRÃO) ---
        // O App pode mandar um log único ou um array de logs (sync)
        let itemsToSave = [];
        if (Array.isArray(body)) {
            itemsToSave = body;
        } else {
            itemsToSave = [body];
        }

        itemsToSave.forEach(log => {
            sheet.appendRow([
                log.id,
                log.date,
                log.water,
                log.coffee,
                log.temp,
                log.coffeeName || '',
                log.grind || '',
                log.notes || ''
            ]);
        });

        return ContentService.createTextOutput(JSON.stringify({ success: true }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CronogramaAnexoDto } from '../models/entities';
import fafiLogoImg from '../assets/images/fafi-logo.png';
import csiLogoImg from '../assets/images/CSI-logo.png';

/**
 * Exporta el cronograma de entregas a un archivo PDF con formato institucional
 * @param cronograma - Array de datos del cronograma
 */
export const exportCronogramaToPDF = async (cronograma: CronogramaAnexoDto[]) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Colores
    const redTitle: [number, number, number] = [200, 16, 46];
    const blackText: [number, number, number] = [0, 0, 0];
    const lightGray: [number, number, number] = [245, 245, 245];
    const borderGray: [number, number, number] = [200, 200, 200];

    // Logos
    doc.addImage(fafiLogoImg, 'PNG', 15, 12, 30, 22);
    doc.addImage(csiLogoImg, 'PNG', 165, 12, 30, 22);

    // Encabezado institucional
    doc.setFontSize(10);
    doc.setTextColor(blackText[0], blackText[1], blackText[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIVERSIDAD TÉCNICA DE BABAHOYO', 105, 18, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('FACULTAD DE ADMINISTRACIÓN, FINANZAS E INFORMÁTICA', 105, 24, { align: 'center' });
    doc.text('ESCUELA DE TECNOLOGÍAS DE LA INFORMACIÓN Y LA COMUNICACIÓN', 105, 29, { align: 'center' });

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(15, 38, 195, 38);

    // Título
    doc.setFontSize(12);
    doc.setTextColor(redTitle[0], redTitle[1], redTitle[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('CRONOGRAMA PARA LA ENTREGA DE LOS ANEXOS DE TUTORÍAS ACADÉMICAS', 105, 48, {
        align: 'center',
        maxWidth: 170
    });

    // Ordenar y agrupar datos
    const sortedCronograma = [...cronograma].sort((a, b) =>
        (a.fechalimite || '').localeCompare(b.fechalimite || '')
    );

    // Crear estructura de datos con información de agrupación
    const groupedData: Array<{
        fecha: string;
        fechaRaw: string;
        documento: string;
        isFirstInGroup: boolean;
        groupSize: number;
    }> = [];

    let i = 0;
    while (i < sortedCronograma.length) {
        const currentDate = sortedCronograma[i].fechalimite;

        let count = 1;
        while (i + count < sortedCronograma.length && sortedCronograma[i + count].fechalimite === currentDate) {
            count++;
        }

        const dateRaw = currentDate?.split('T')[0] || '';
        const dateObj = new Date(dateRaw + 'T12:00:00');
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = dateObj.toLocaleDateString('es-ES', { month: 'long' });
        const year = dateObj.getFullYear();
        const formattedDate = `${day} de ${month} de ${year}`;

        for (let j = 0; j < count; j++) {
            const item = sortedCronograma[i + j];
            groupedData.push({
                fecha: formattedDate,
                fechaRaw: currentDate,
                documento: `${item.tipo_documento_nombre || 'Documento'} - ${item.descripcion}`,
                isFirstInGroup: j === 0,
                groupSize: count
            });
        }

        i += count;
    }

    const tableData = groupedData.map(row => [row.fecha, row.documento]);

    // Generar tabla
    autoTable(doc, {
        startY: 58,
        head: [['Fecha de entrega', 'Documentos a presentar']],
        body: tableData,
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 10,
            cellPadding: 5,
            lineColor: borderGray,
            lineWidth: 0.3,
            valign: 'middle',
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: lightGray,
            textColor: blackText,
            fontSize: 10.5,
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            cellPadding: 6
        },
        bodyStyles: {
            fontSize: 10,
            textColor: blackText,
            fillColor: [255, 255, 255],
            halign: 'center',
            valign: 'middle'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 55 },
            1: { halign: 'center', cellWidth: 'auto' }
        },
        margin: { left: 25, right: 25 },
        willDrawCell: function (data) {
            // Solo prevenir dibujo en las celdas subsecuentes del grupo
            if (data.section === 'body' && data.column.index === 0) {
                const rowInfo = groupedData[data.row.index];
                if (!rowInfo.isFirstInGroup) {
                    return false; // No dibujar nada para estas celdas (ni bordes ni texto)
                }
            }
        },
        didDrawCell: function (data) {
            // Dibujar manualmente la celda combinada sobre la primera celda del grupo
            if (data.section === 'body' && data.column.index === 0) {
                const rowInfo = groupedData[data.row.index];

                if (rowInfo.isFirstInGroup && rowInfo.groupSize > 1) {
                    // Calcular altura total del grupo sumando las alturas de las filas reales
                    let mergedHeight = 0;
                    try {
                        // Acceder a las filas generadas por autoTable para obtener sus alturas reales
                        // data.table.body contiene todas las filas
                        for (let k = 0; k < rowInfo.groupSize; k++) {
                            const rowIndex = data.row.index + k;
                            if (rowIndex < data.table.body.length) {
                                mergedHeight += data.table.body[rowIndex].height;
                            }
                        }
                    } catch (e) {
                        // Fallback por si acaso falla el acceso
                        mergedHeight = data.cell.height * rowInfo.groupSize;
                    }

                    // Limpiar el área (fondo blanco para tapar líneas de grid subyacentes)
                    doc.setFillColor(255, 255, 255);
                    doc.rect(data.cell.x, data.cell.y, data.cell.width, mergedHeight, 'F');

                    // Dibujar borde externo de la celda combinada
                    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
                    doc.setLineWidth(0.3);
                    doc.rect(data.cell.x, data.cell.y, data.cell.width, mergedHeight, 'S');

                    // Texto centrado verticalmente en el área total
                    doc.setTextColor(blackText[0], blackText[1], blackText[2]);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');

                    const textX = data.cell.x + (data.cell.width / 2);
                    const textY = data.cell.y + (mergedHeight / 2);

                    doc.text(
                        rowInfo.fecha,
                        textX,
                        textY,
                        { align: 'center', baseline: 'middle' }
                    );
                }
            }
        }
    });

    // Pie de página
    const pageCount = doc.getNumberOfPages();
    const currentDate = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(15, 280, 195, 280);

        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.setFont('helvetica', 'italic');
        doc.text(`Generado el ${currentDate}`, 105, 285, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: 'right' });
    }

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');

    setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
};

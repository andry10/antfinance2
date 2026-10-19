import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Expense, BusinessSettings } from '../types';
import { formatRupiah, formatDateTime } from './formatters';

interface DailyReportData {
  dateLabel: string;
  transactions: Transaction[];
  expenses: Expense[];
  settings: BusinessSettings;
  summary: {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    totalExpenses: number;
    netProfit: number;
    transactionCount: number;
    itemsSold: number;
  };
}

export function generateDailySalesReportPDF(data: DailyReportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Business Name & Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.settings.businessName || 'CATAT USAHA', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`${data.settings.address || ''} | Telp: ${data.settings.phone || '-'}`, 14, 19);

  // Document Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('LAPORAN PENJUALAN HARIAN', 14, 36);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Periode: ${data.dateLabel} | Dicetak: ${formatDateTime(new Date().toISOString())}`, 14, 42);

  // Financial Summary Cards / Table
  const summaryBody = [
    [
      'Total Omzet (Penjualan)',
      formatRupiah(data.summary.totalRevenue),
      'Total Transaksi Selesai',
      `${data.summary.transactionCount} Transaksi`,
    ],
    [
      'Total Modal (HPP)',
      formatRupiah(data.summary.totalCost),
      'Total Produk Terjual',
      `${data.summary.itemsSold} Item`,
    ],
    [
      'Laba Kotor Penjualan',
      formatRupiah(data.summary.grossProfit),
      'Pengeluaran Operasional',
      formatRupiah(data.summary.totalExpenses),
    ],
    [
      'LABA BERSIH ESTIMASI',
      formatRupiah(data.summary.netProfit),
      'Rata-rata Nilai Belanja',
      formatRupiah(data.summary.transactionCount > 0 ? data.summary.totalRevenue / data.summary.transactionCount : 0),
    ],
  ];

  autoTable(doc, {
    startY: 47,
    head: [['Indikator Finansial', 'Nilai', 'Indikator Operasional', 'Nilai']],
    body: summaryBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110], // teal-700
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { halign: 'right', cellWidth: 45 },
      2: { fontStyle: 'bold', cellWidth: 50 },
      3: { halign: 'right', cellWidth: 42 },
    },
  });

  // Top Products Breakdown
  let currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 85;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Produk Terlaris', 14, currentY);

  // Compute product sales
  const productSalesMap = new Map<string, { name: string; qty: number; revenue: number }>();
  data.transactions
    .filter((t) => t.status === 'completed')
    .forEach((tx) => {
      tx.items.forEach((item) => {
        const existing = productSalesMap.get(item.productId) || { name: item.name, qty: 0, revenue: 0 };
        existing.qty += item.quantity;
        existing.revenue += item.subtotal;
        productSalesMap.set(item.productId, existing);
      });
    });

  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  const topProductsBody = topProducts.length > 0
    ? topProducts.map((p, idx) => [
        String(idx + 1),
        p.name,
        `${p.qty} item`,
        formatRupiah(p.revenue),
      ])
    : [['-', 'Belum ada transaksi pada periode ini', '-', '-']];

  autoTable(doc, {
    startY: currentY + 3,
    head: [['No', 'Nama Produk', 'Jumlah Terjual', 'Total Omzet']],
    body: topProductsBody,
    theme: 'striped',
    headStyles: {
      fillColor: [71, 85, 105], // slate-600
      textColor: 255,
      fontSize: 8.5,
    },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 90 },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 45, halign: 'right' },
    },
  });

  // Detailed Transactions Table
  currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 130;

  // Add new page if too low
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Rincian Transaksi Penjualan', 14, currentY);

  const completedTx = data.transactions.filter((t) => t.status === 'completed');
  const txBody = completedTx.length > 0
    ? completedTx.map((tx, idx) => [
        String(idx + 1),
        tx.invoiceNumber,
        formatDateTime(tx.createdAt),
        tx.customerName || 'Umum',
        tx.paymentMethod,
        tx.cashierName || 'Kasir',
        formatRupiah(tx.finalAmount),
      ])
    : [['-', 'Tidak ada transaksi', '-', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: currentY + 3,
    head: [['No', 'No. Invoice', 'Waktu', 'Pelanggan', 'Metode', 'Kasir', 'Total']],
    body: txBody,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: 255,
      fontSize: 8.5,
    },
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 38 },
      2: { cellWidth: 30 },
      3: { cellWidth: 32 },
      4: { cellWidth: 25 },
      5: { cellWidth: 22 },
      6: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
    },
  });

  // Footer page numbering
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Halaman ${i} dari ${pageCount} • Dicetak otomatis oleh CatatUsaha POS Realtime`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  // Save the PDF
  const safeDate = data.dateLabel.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Laporan_Penjualan_${safeDate}.pdf`);
}

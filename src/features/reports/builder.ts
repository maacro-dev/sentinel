import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export class ReportBuilder {
  private doc: jsPDF;
  private yPos: number;
  private logoBase64?: string;

  private logOutput = '';

  private log(title: string, data: any) {
    this.logOutput += `\n=== ${title} ===\n`;
    this.logOutput += JSON.stringify(data, null, 2) + '\n';
  }

  constructor(logoBase64?: string) {
    this.doc = new jsPDF();
    this.yPos = 20;
    this.logoBase64 = logoBase64;
  }

  getLog() {
    return this.logOutput;
  }

  addPageBreak() {
    this.doc.addPage();
    this.yPos = 20;
  }

  addSectionTitle(text: string, fontSize = 16) {
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(0);
    this.doc.text(text, 14, this.yPos);
    this.yPos += 8;
  }

  setLogo(logoBase64: string) {
    this.logoBase64 = logoBase64;
  }

  addHeader(title: string, season?: string) {
    if (this.logoBase64) {
      try {
        const logoWidth = 16; // mm
        const logoHeight = 16; // mm
        this.doc.addImage(this.logoBase64, 'PNG', 14, this.yPos, logoWidth, logoHeight);
        this.doc.setFontSize(18);
        this.doc.text(title, this.doc.internal.pageSize.width - 14, this.yPos + logoHeight / 2, { align: 'right' });
        if (season) {
          this.doc.setFontSize(11);
          this.doc.setTextColor(100);
          this.doc.text(season, this.doc.internal.pageSize.width - 14, this.yPos + logoHeight / 2 + 5, { align: 'right' });
          this.doc.setTextColor(0);
        }
        this.yPos += logoHeight + 10;
        return;
      } catch (err) {
        console.warn('Failed to add logo, falling back to text', err);
      }
    }

    this.doc.setFontSize(12);
    this.doc.setTextColor(100);
    this.doc.text('Humay Sentinel', 14, this.yPos);
    this.doc.setTextColor(0);
    this.doc.setFontSize(18);
    this.doc.text(title, this.doc.internal.pageSize.width - 14, this.yPos, { align: 'right' });
    if (season) {
      this.doc.setFontSize(11);
      this.doc.setTextColor(100);
      this.doc.text(season, this.doc.internal.pageSize.width - 14, this.yPos + 6, { align: 'right' });
      this.doc.setTextColor(0);
      this.yPos += 16;
    } else {
      this.yPos += 10;
    }
  }

  addExportMetadata(userName?: string) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    this.doc.setFontSize(9);
    this.doc.setTextColor(150);
    this.doc.text(`Exported on ${dateStr} at ${timeStr}`, 14, this.yPos);
    if (userName) {
      this.doc.text(`by ${userName}`, 14, this.yPos + 4);
      this.yPos += 8;
    } else {
      this.yPos += 4;
    }
    this.doc.setTextColor(0);
  }

  addParagraph(text: string) {
    this.doc.setFontSize(10);
    this.doc.text(text, 14, this.yPos);
    this.yPos += 6;
  }

  addSubheading(text: string, bottomSpacing?: number) {
    this.doc.setFontSize(12);
    this.doc.text(text, 14, this.yPos);
    this.yPos += bottomSpacing || 6;
  }

  // addTitle(text: string, fontSize = 18) {
  //   this.doc.setFontSize(fontSize);
  //   this.doc.text(text, 14, this.yPos);
  //   this.yPos += 8;
  // }

  // addSubtitle(text: string, fontSize = 11) {
  //   this.doc.setFontSize(fontSize);
  //   this.doc.setTextColor(100);
  //   this.doc.text(text, 14, this.yPos);
  //   this.doc.setTextColor(0);
  //   this.yPos += 8;
  // }

  addTable(headers: string[], rows: any[][], title?: string, columnWidths?: number[]) {
    if (title) {
      this.doc.setFontSize(12);
      this.doc.text(title, 14, this.yPos);
      this.yPos += 6;
      this.log(title, rows);
    }

    const margin = 14;
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - margin * 2;
    const colCount = headers.length;

    let columnStyles: any = {};
    if (columnWidths) {
      const totalPercent = columnWidths.reduce((sum, w) => sum + w, 0);
      const normalizedWidths = columnWidths.map(p => (p / totalPercent) * usableWidth);
      columnStyles = normalizedWidths.reduce((acc, w, i) => ({ ...acc, [i]: { cellWidth: w } }), {});
    } else {
      const equalWidth = usableWidth / colCount;
      columnStyles = headers.reduce((acc, _, i) => ({ ...acc, [i]: { cellWidth: equalWidth } }), {});
    }

    autoTable(this.doc, {
      startY: this.yPos,
      head: [headers],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: margin, right: margin },
      columnStyles,
    });

    this.yPos = (this.doc as any).lastAutoTable.finalY + 10;
  }

  save(filename: string) {
    this.doc.save(filename);
  }
}


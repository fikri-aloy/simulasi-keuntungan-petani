// ===== PDF EXPORT SYSTEM =====
class PDFExporter {
    constructor() {
        // Pastikan jsPDF tersedia
        if (typeof window.jspdf === 'undefined') {
            console.error('jsPDF not loaded!');
            return;
        }
        this.jsPDF = window.jspdf.jsPDF;
        console.log('✅ PDFExporter initialized');
    }

    // Export simulation result to PDF
    exportSimulationToPDF(simulationData, userData) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Set document properties
            doc.setProperties({
                title: `Simulasi ${simulationData.cropType} - AgroProfit`,
                subject: 'Hasil Simulasi Pertanian',
                author: userData.name || 'Pengguna AgroProfit',
                keywords: 'pertanian, simulasi, keuntungan, ROI',
                creator: 'AgroProfit Web App'
            });

            // Add logo/header
            doc.setFontSize(20);
            doc.setTextColor(40, 180, 99); // Green color
            doc.text('AgroProfit', 105, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text('Simulasi Keuntungan Pertanian', 105, 28, { align: 'center' });
            
            // Add line separator
            doc.setDrawColor(200, 200, 200);
            doc.line(20, 32, 190, 32);

            // Document info
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(`Dibuat oleh: ${userData.name}`, 20, 40);
            doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 20, 45);
            
            // Simulation title
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text(`Simulasi: ${this.getCropName(simulationData.cropType)}`, 20, 60);

            // Simulation parameters
            doc.setFontSize(12);
            doc.text('Parameter Input:', 20, 70);
            
            doc.setFontSize(10);
            let yPos = 78;
            
            const params = [
                { label: 'Jenis Tanaman', value: this.getCropName(simulationData.cropType) },
                { label: 'Luas Lahan', value: `${simulationData.landArea} ${simulationData.unit === 'meter' ? 'm²' : 'Hektar'}` },
                { label: 'Biaya Bibit', value: this.formatCurrency(simulationData.seedCost) },
                { label: 'Biaya Pupuk & Pestisida', value: this.formatCurrency(simulationData.fertilizerCost) },
                { label: 'Biaya Tenaga Kerja', value: this.formatCurrency(simulationData.laborCost) },
                { label: 'Estimasi Hasil Panen', value: `${simulationData.estimatedHarvest} kg` },
                { label: 'Harga Jual per kg', value: this.formatCurrency(simulationData.pricePerKg) }
            ];

            params.forEach(param => {
                doc.text(`${param.label}:`, 25, yPos);
                doc.text(param.value, 100, yPos);
                yPos += 6;
            });

            // Results section
            yPos += 10;
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text('Hasil Simulasi:', 20, yPos);
            
            yPos += 10;
            doc.setFontSize(10);
            
            const results = [
                { label: 'Total Modal', value: this.formatCurrency(simulationData.totalCost) },
                { label: 'Total Pendapatan', value: this.formatCurrency(simulationData.totalRevenue) },
                { label: 'Keuntungan', value: this.formatCurrency(simulationData.profit), color: simulationData.profit >= 0 ? [46, 125, 50] : [198, 40, 40] },
                { label: 'ROI (Return on Investment)', value: `${simulationData.roi}%`, color: simulationData.roi >= 0 ? [46, 125, 50] : [198, 40, 40] }
            ];

            results.forEach(result => {
                doc.setTextColor(0, 0, 0);
                doc.text(`${result.label}:`, 25, yPos);
                
                if (result.color) {
                    doc.setTextColor(result.color[0], result.color[1], result.color[2]);
                }
                
                doc.text(result.value, 100, yPos);
                
                // Reset color
                doc.setTextColor(0, 0, 0);
                yPos += 6;
            });

            // Analysis section
            yPos += 10;
            doc.setFontSize(12);
            doc.text('Analisis:', 20, yPos);
            
            yPos += 10;
            doc.setFontSize(10);
            
            const analysis = this.getAnalysisText(simulationData);
            const analysisLines = doc.splitTextToSize(analysis, 160);
            
            analysisLines.forEach(line => {
                doc.text(line, 25, yPos);
                yPos += 6;
            });

            // Footer
            yPos += 10;
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('© ' + new Date().getFullYear() + ' AgroProfit - Simulasi Keuntungan Pertanian', 105, yPos, { align: 'center' });
            yPos += 4;
            doc.text('Dokumen ini dibuat secara otomatis oleh sistem AgroProfit', 105, yPos, { align: 'center' });

            // Save PDF
            const filename = `Simulasi_${simulationData.cropType}_${new Date().getTime()}.pdf`;
            doc.save(filename);
            
            console.log('✅ PDF exported:', filename);
            return { success: true, filename };
            
        } catch (error) {
            console.error('PDF export error:', error);
            return { 
                success: false, 
                message: 'Gagal mengexport PDF: ' + error.message 
            };
        }
    }

    // Export dashboard summary to PDF
    exportDashboardToPDF(userData, simulations, badges) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(20);
            doc.setTextColor(40, 180, 99);
            doc.text('AgroProfit Dashboard', 105, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text('Ringkasan Aktivitas Pertanian', 105, 28, { align: 'center' });
            
            doc.line(20, 32, 190, 32);

            // User info
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Nama: ${userData.name}`, 20, 42);
            doc.text(`Email: ${userData.email}`, 20, 48);
            doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 20, 54);

            // Stats
            doc.setFontSize(14);
            doc.text('Statistik Pengguna:', 20, 68);
            
            doc.setFontSize(10);
            let yPos = 76;
            
            const stats = [
                { label: 'Total Poin', value: userData.points },
                { label: 'Total Simulasi', value: userData.simulationsCount },
                { label: 'Level', value: userData.level },
                { label: 'Badges', value: badges.length }
            ];

            stats.forEach(stat => {
                doc.text(`${stat.label}:`, 25, yPos);
                doc.text(stat.value.toString(), 80, yPos);
                yPos += 6;
            });

            // Recent simulations
            yPos += 10;
            doc.setFontSize(14);
            doc.text('Simulasi Terbaru:', 20, yPos);
            
            if (simulations.length > 0) {
                yPos += 10;
                doc.setFontSize(10);
                
                // Table header
                doc.setFillColor(240, 240, 240);
                doc.rect(20, yPos, 170, 8, 'F');
                doc.text('Tanaman', 25, yPos + 6);
                doc.text('Keuntungan', 100, yPos + 6);
                doc.text('ROI', 150, yPos + 6);
                
                yPos += 8;
                
                // Table rows
                simulations.slice(0, 10).forEach(sim => {
                    if (yPos > 270) { // Avoid page overflow
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    doc.text(this.getCropName(sim.cropType) || 'Tanaman', 25, yPos + 6);
                    doc.text(this.formatCurrency(sim.profit), 100, yPos + 6);
                    doc.text(`${sim.roi}%`, 150, yPos + 6);
                    yPos += 8;
                });
            } else {
                yPos += 8;
                doc.setFontSize(10);
                doc.text('Belum ada simulasi', 25, yPos);
            }

            // Badges section
            if (badges.length > 0) {
                yPos += 15;
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setFontSize(14);
                doc.text('Badges yang Diperoleh:', 20, yPos);
                
                yPos += 8;
                doc.setFontSize(10);
                
                badges.forEach(badge => {
                    doc.text(`${badge.icon} ${badge.name}`, 25, yPos);
                    yPos += 6;
                });
            }

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Halaman ${i} dari ${pageCount}`, 105, 287, { align: 'center' });
                doc.text('© AgroProfit - www.agroprofit.example.com', 105, 290, { align: 'center' });
            }

            // Save PDF
            const filename = `Dashboard_${userData.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
            doc.save(filename);
            
            console.log('✅ Dashboard PDF exported:', filename);
            return { success: true, filename };
            
        } catch (error) {
            console.error('Dashboard PDF export error:', error);
            return { 
                success: false, 
                message: 'Gagal mengexport dashboard PDF: ' + error.message 
            };
        }
    }

    // Helper methods
    formatCurrency(amount) {
        return 'Rp ' + amount.toLocaleString('id-ID');
    }

    getCropName(cropType) {
        const cropNames = {
            'padi': 'Padi Sawah',
            'jagung': 'Jagung',
            'kedelai': 'Kedelai',
            'cabe': 'Cabe Merah',
            'tomat': 'Tomat',
            'bawang': 'Bawang Merah'
        };
        return cropNames[cropType] || cropType;
    }

    getAnalysisText(simulation) {
        let analysis = '';
        
        if (simulation.profit > 0) {
            if (simulation.roi > 50) {
                analysis = 'Hasil simulasi menunjukkan keuntungan yang SANGAT BAIK. ROI di atas 50% menandakan investasi yang sangat menguntungkan. Disarankan untuk melanjutkan dengan rencana ini.';
            } else if (simulation.roi > 20) {
                analysis = 'Hasil simulasi menunjukkan keuntungan yang BAIK. ROI antara 20-50% merupakan tingkat pengembalian yang sehat untuk usaha pertanian.';
            } else {
                analysis = 'Hasil simulasi menunjukkan keuntungan yang MODERAT. ROI positif namun masih dalam batas wajar. Pertimbangkan untuk mengoptimalkan biaya produksi.';
            }
        } else {
            analysis = 'Hasil simulasi menunjukkan KERUGIAN. Disarankan untuk: 1) Meninjau kembali biaya produksi, 2) Mencari pemasok bahan dengan harga lebih kompetitif, 3) Mempertimbangkan jenis tanaman lain, 4) Meningkatkan produktivitas lahan.';
        }
        
        return analysis;
    }

    // Export HTML element as PDF (for charts/screenshots)
    exportHTMLToPDF(elementId, filename = 'export.pdf') {
        return new Promise((resolve, reject) => {
            const element = document.getElementById(elementId);
            if (!element) {
                reject(new Error(`Element with ID ${elementId} not found`));
                return;
            }

            html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                
                const imgWidth = 190;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
                doc.save(filename);
                
                resolve({ success: true, filename });
            }).catch(error => {
                console.error('HTML to PDF error:', error);
                reject(error);
            });
        });
    }
}

// Create global instance
window.PDFExporter = PDFExporter;
window.pdfExport = new PDFExporter();

console.log('✅ PDF Export system loaded');
// ===== PROFIT CALCULATOR =====
class ProfitCalculator {
    constructor() {
        this.cropDefaults = {
            padi: { 
                name: 'Padi Sawah',
                harvest: 6000, 
                price: 5000,
                seedCost: 2000000,
                fertilizerCost: 1500000,
                laborCost: 3000000
            },
            jagung: { 
                name: 'Jagung',
                harvest: 5000, 
                price: 4000,
                seedCost: 1500000,
                fertilizerCost: 1200000,
                laborCost: 2500000
            },
            kedelai: { 
                name: 'Kedelai',
                harvest: 2000, 
                price: 8000,
                seedCost: 1000000,
                fertilizerCost: 800000,
                laborCost: 2000000
            },
            cabe: { 
                name: 'Cabe Merah',
                harvest: 10000, 
                price: 25000,
                seedCost: 3000000,
                fertilizerCost: 2000000,
                laborCost: 4000000
            },
            tomat: { 
                name: 'Tomat',
                harvest: 15000, 
                price: 5000,
                seedCost: 1200000,
                fertilizerCost: 1000000,
                laborCost: 2500000
            },
            bawang: { 
                name: 'Bawang Merah',
                harvest: 8000, 
                price: 15000,
                seedCost: 2500000,
                fertilizerCost: 1800000,
                laborCost: 3500000
            }
        };
    }

    // Calculate profit from form data
    calculate(data) {
        const {
            cropType,
            landArea,
            unit,
            seedCost,
            fertilizerCost,
            laborCost,
            estimatedHarvest,
            pricePerKg
        } = data;

        // Convert to hectares if in meters
        const areaInHectares = unit === 'meter' ? landArea / 10000 : landArea;

        // Calculate totals
        const totalCost = (seedCost + fertilizerCost + laborCost) * areaInHectares;
        const totalRevenue = (estimatedHarvest * pricePerKg) * areaInHectares;
        const profit = totalRevenue - totalCost;
        const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

        // Get crop name
        const cropName = this.cropDefaults[cropType]?.name || cropType;

        return {
            totalCost: Math.round(totalCost),
            totalRevenue: Math.round(totalRevenue),
            profit: Math.round(profit),
            roi: parseFloat(roi.toFixed(2)),
            cropType: cropName,
            cropCode: cropType,
            landArea,
            unit,
            seedCost,
            fertilizerCost,
            laborCost,
            estimatedHarvest,
            pricePerKg,
            calculatedAt: new Date().toISOString()
        };
    }

    // Get default values for a crop
    getCropDefaults(cropType) {
        return this.cropDefaults[cropType] || { 
            name: cropType,
            harvest: 0, 
            price: 0,
            seedCost: 0,
            fertilizerCost: 0,
            laborCost: 0
        };
    }

    // Format currency to IDR
    formatCurrency(amount) {
        return 'Rp ' + amount.toLocaleString('id-ID');
    }

    // Format number with thousand separators
    formatNumber(num) {
        return num.toLocaleString('id-ID');
    }

    // Get all crop options for dropdown
    getCropOptions() {
        return Object.keys(this.cropDefaults).map(key => ({
            value: key,
            label: this.cropDefaults[key].name
        }));
    }

    // Update form with crop defaults
    updateFormWithCropDefaults(cropType) {
        const defaults = this.getCropDefaults(cropType);
        
        return {
            seedCost: defaults.seedCost,
            fertilizerCost: defaults.fertilizerCost,
            laborCost: defaults.laborCost,
            estimatedHarvest: defaults.harvest,
            pricePerKg: defaults.price
        };
    }
}
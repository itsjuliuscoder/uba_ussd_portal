// For now, this is a simple configuration controller
// In a production system, you might want to store config in a database table

/**
 * Get system configuration
 * GET /api/config
 */
exports.getConfig = async (req, res) => {
  try {
    // This is a placeholder - in production, fetch from database or config file
    const config = {
      systemName: "UBA USSD Menu",
      version: "1.0.0",
      supportedWallets: ["moov", "mtn", "celtiis"],
      supportedLanguages: ["en", "fr"],
      maxPinAttempts: 3,
      sessionTimeout: 300, // seconds
      minTransactionAmount: 100,
      maxTransactionAmount: 1000000,
    };

    res.json({
      success: true,
      data: { config },
    });
  } catch (error) {
    console.error("Get config error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching configuration",
    });
  }
};

/**
 * Update system configuration
 * PUT /api/config
 */
exports.updateConfig = async (req, res) => {
  try {
    // This is a placeholder - in production, save to database
    const { config } = req.body;

    // Validate and update config
    // In production, you would save this to a database table

    res.json({
      success: true,
      message: "Configuration updated successfully",
      data: { config },
    });
  } catch (error) {
    console.error("Update config error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating configuration",
    });
  }
};

/**
 * Get USSD menu text configurations
 * GET /api/config/menu-text
 */
exports.getMenuText = async (req, res) => {
  try {
    // This is a placeholder - in production, fetch from database
    // The actual menu text is in the controller, but for management,
    // you might want to store it in a database table
    const menuText = {
      en: {
        welcome: "Welcome to UBA USSD Banking",
        indexMenu:
          "\n1. Buy Airtime \n2. Buy Data  \n3. UBA to UBA Transfer \n4. Fund Mobile Wallet \n5. Mini Statement \n6. Check Balance \n7. Prepaid Card Funding \n8. Cardless Withdrawal",
      },
      fr: {
        welcome: "Bienvenue sur UBA USSD Banking",
        indexMenu:
          "\n1. Acheter du crédit d'antenne. \n2. Acheter des données \n3. Virement UBA vers UBA \n4. Approvisionner un portefeuille mobile \n5. Obtenir du temps d'antenne  \n6. Mini relevé \n7. Vérifier le solde \n8. Financement par carte prépayée \n9. Retrait sans carte",
      },
    };

    res.json({
      success: true,
      data: { menuText },
    });
  } catch (error) {
    console.error("Get menu text error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching menu text",
    });
  }
};

/**
 * Update USSD menu text
 * PUT /api/config/menu-text
 */
exports.updateMenuText = async (req, res) => {
  try {
    const { language, menuText } = req.body;

    if (!language || !menuText) {
      return res.status(400).json({
        success: false,
        message: "Language and menuText are required",
      });
    }

    if (!["en", "fr"].includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Language must be either "en" or "fr"',
      });
    }

    // In production, save to database
    // For now, this is just a placeholder

    res.json({
      success: true,
      message: "Menu text updated successfully",
      data: { language, menuText },
    });
  } catch (error) {
    console.error("Update menu text error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating menu text",
    });
  }
};

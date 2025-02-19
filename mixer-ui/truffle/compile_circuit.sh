#!/bin/bash

# Définition des couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
print_step() {
    echo -e "${BLUE}[ÉTAPE]${NC} $1"
}

# Fonction pour afficher les succès
print_success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

# Fonction pour gérer les erreurs
handle_error() {
    echo -e "${RED}[ERREUR]${NC} $1"
    exit 1
}

print_step "Création des dossiers nécessaires..."
# Créer une structure de dossiers propre
mkdir -p build/circuits
mkdir -p build/contracts

# Se déplacer dans le dossier des circuits
cd build/circuits || handle_error "Impossible d'accéder au dossier build/circuits"

print_step "Compilation du circuit Circom..."
# Compiler le circuit

circom ../../circuits/withdraw.circom -l ./node_modules/circomlib/circuits --r1cs --wasm --sym --c --json || handle_error "Échec de la compilation du circuit"
print_success "Circuit compilé avec succès"

print_step "Génération des paramètres Powers of Tau..."
# Démarrer une nouvelle cérémonie Powers of Tau
snarkjs powersoftau new bn128 16 pot16_0000.ptau -v || handle_error "Échec de la génération Powers of Tau"

print_step "Contribution à la Phase 1..."
# Première contribution
echo "Contribution random" | snarkjs powersoftau contribute pot16_0000.ptau pot16_0001.ptau --name="Première contribution" -v || handle_error "Échec de la contribution Phase 1"

print_step "Préparation de la Phase 2..."
# Préparer la phase 2
snarkjs powersoftau prepare phase2 pot16_0001.ptau pot16_final.ptau -v || handle_error "Échec de la préparation Phase 2"

print_step "Configuration du circuit..."
# Setup du circuit spécifique
snarkjs groth16 setup withdraw.r1cs pot16_final.ptau withdraw_0000.zkey || handle_error "Échec du setup Groth16"

print_step "Contribution à la Phase 2..."
# Contribution à la phase 2
echo "Contribution random" | snarkjs zkey contribute withdraw_0000.zkey withdraw_final.zkey --name="1st Contributor" -v || handle_error "Échec de la contribution Phase 2"

print_step "Exportation du contrat vérificateur..."
# Exporter le contrat vérificateur
snarkjs zkey export solidityverifier withdraw_final.zkey ../../contracts/Verifier.sol || handle_error "Échec de l'export du contrat"

print_step "Génération des fichiers de vérification..."
# Exporter la clé de vérification
snarkjs zkey export verificationkey withdraw_final.zkey verification_key.json || handle_error "Échec de l'export de la clé de vérification"

# Revenir au dossier racine
cd ../../..

print_success "Circuit compilé et contrat généré avec succès!"
echo -e "${GREEN}Fichiers générés :${NC}"
echo "- build/circuits/withdraw.r1cs (contraintes du circuit)"
echo "- build/circuits/withdraw.wasm (pour le calcul des témoins)"
echo "- build/contracts/Verifier.sol (contrat de vérification)"
echo "- build/circuits/verification_key.json (clé de vérification)"

# Permissions d'exécution
chmod -R 755 build/circuits/withdraw_* || handle_error "Échec de la modification des permissions"
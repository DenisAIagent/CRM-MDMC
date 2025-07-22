import { z } from 'zod';

// Schéma de validation pour les clients selon les spécifications exactes
export const clientSchema = z.object({
  nom: z
    .string()
    .min(2, "Le nom doit faire au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .trim(),
  
  email: z
    .string()
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères")
    .toLowerCase(),
  
  telephone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(?:\+33|0)[1-9](?:[0-9]{8})$/.test(val.replace(/\s/g, '')),
      "Format de téléphone français invalide"
    ),
  
  genre_musical: z.enum(
    ['rap', 'pop', 'rock', 'électro', 'r&b', 'jazz', 'autre'],
    { errorMap: () => ({ message: "Genre musical invalide" }) }
  ),
  
  reseaux_sociaux: z.object({
    instagram: z
      .string()
      .url("URL Instagram invalide")
      .optional()
      .or(z.literal("")),
    spotify: z
      .string()
      .url("URL Spotify invalide")
      .optional()
      .or(z.literal("")),
    youtube: z
      .string()
      .url("URL YouTube invalide")
      .optional()
      .or(z.literal(""))
  }).optional(),
  
  newsletter_inscrit: z.boolean().optional(),
  
  statut: z
    .enum(['prospect', 'client_actif', 'ancien_client'])
    .optional(),
  
  tags: z.array(z.string()).optional()
});

// Schéma pour l'envoi d'emails
export const emailSchema = z.object({
  to: z
    .string()
    .email("Adresse email destinataire invalide"),
  
  subject: z
    .string()
    .min(1, "Le sujet est requis")
    .max(200, "Le sujet ne peut pas dépasser 200 caractères")
    .trim(),
  
  body: z
    .string()
    .min(1, "Le corps du message est requis")
    .max(5000, "Le message ne peut pas dépasser 5000 caractères")
    .trim(),
  
  clientId: z
    .string()
    .optional()
});

// Schéma pour les opportunités
export const opportunitySchema = z.object({
  client_id: z
    .string()
    .min(1, "ID client requis"),
  
  titre: z
    .string()
    .min(3, "Le titre doit faire au moins 3 caractères")
    .max(200, "Le titre ne peut pas dépasser 200 caractères")
    .trim(),
  
  description: z
    .string()
    .max(1000, "La description ne peut pas dépasser 1000 caractères")
    .optional(),
  
  mots_cles_triggers: z
    .array(z.string())
    .optional(),
  
  email_source_id: z
    .string()
    .optional(),
  
  statut: z
    .enum(['nouveau', 'en_cours', 'qualifie', 'perdu'])
    .optional()
});

// Utilitaires de validation
export class ValidationUtils {
  // Valider et nettoyer les données client
  static validateClientData(data) {
    try {
      // Nettoyage des réseaux sociaux
      if (data.reseaux_sociaux) {
        Object.keys(data.reseaux_sociaux).forEach(key => {
          if (!data.reseaux_sociaux[key]) {
            delete data.reseaux_sociaux[key];
          }
        });
      }

      const validatedData = clientSchema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      return {
        success: false,
        errors: error.errors || [{ message: error.message }]
      };
    }
  }

  // Valider les données d'email
  static validateEmailData(data) {
    try {
      const validatedData = emailSchema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      return {
        success: false,
        errors: error.errors || [{ message: error.message }]
      };
    }
  }

  // Valider les données d'opportunité
  static validateOpportunityData(data) {
    try {
      const validatedData = opportunitySchema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      return {
        success: false,
        errors: error.errors || [{ message: error.message }]
      };
    }
  }

  // Formatage des erreurs pour l'affichage
  static formatValidationErrors(errors) {
    if (!Array.isArray(errors)) return ['Erreur de validation'];
    
    return errors.map(error => {
      if (error.path && error.path.length > 0) {
        const fieldName = this.getFieldDisplayName(error.path.join('.'));
        return `${fieldName}: ${error.message}`;
      }
      return error.message;
    });
  }

  // Nom d'affichage des champs
  static getFieldDisplayName(path) {
    const fieldNames = {
      'nom': 'Nom',
      'email': 'Email',
      'telephone': 'Téléphone',
      'genre_musical': 'Genre musical',
      'reseaux_sociaux.instagram': 'Instagram',
      'reseaux_sociaux.spotify': 'Spotify',
      'reseaux_sociaux.youtube': 'YouTube',
      'newsletter_inscrit': 'Newsletter',
      'to': 'Destinataire',
      'subject': 'Sujet',
      'body': 'Message',
      'titre': 'Titre',
      'description': 'Description',
      'client_id': 'Client'
    };
    
    return fieldNames[path] || path;
  }

  // Validation côté client pour les URLs
  static isValidUrl(url) {
    if (!url || url.trim() === '') return true; // Les URLs vides sont autorisées
    
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validation du format email côté client
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validation du téléphone français
  static isValidFrenchPhone(phone) {
    if (!phone || phone.trim() === '') return true;
    
    const cleanPhone = phone.replace(/\s/g, '');
    const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
    return phoneRegex.test(cleanPhone);
  }

  // Nettoyer les données avant soumission
  static sanitizeClientData(data) {
    const sanitized = { ...data };
    
    // Nettoyer les chaînes
    if (sanitized.nom) sanitized.nom = sanitized.nom.trim();
    if (sanitized.email) sanitized.email = sanitized.email.toLowerCase().trim();
    if (sanitized.telephone) sanitized.telephone = sanitized.telephone.trim();
    
    // Nettoyer les réseaux sociaux
    if (sanitized.reseaux_sociaux) {
      Object.keys(sanitized.reseaux_sociaux).forEach(key => {
        if (sanitized.reseaux_sociaux[key]) {
          sanitized.reseaux_sociaux[key] = sanitized.reseaux_sociaux[key].trim();
        } else {
          delete sanitized.reseaux_sociaux[key];
        }
      });
    }
    
    // Supprimer les propriétés vides
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === '' || sanitized[key] === null || sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });
    
    return sanitized;
  }
}

export default ValidationUtils;
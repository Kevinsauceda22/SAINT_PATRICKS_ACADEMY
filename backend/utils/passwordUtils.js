/**
 * Genera una contraseña temporal segura con las siguientes características:
 * - Longitud de 12 caracteres
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 * - Al menos un número
 * - Al menos un carácter especial
 * 
 * @returns {string} Contraseña temporal generada
 */
export const generateTemporaryPassword = () => {
    // Definimos los conjuntos de caracteres
    const numeros = '0123456789';
    const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const minusculas = 'abcdefghijklmnopqrstuvwxyz';
    const especiales = '!@#$%^&*';
    
    // Iniciamos la contraseña vacía
    let password = '';
    
    // Aseguramos al menos un carácter de cada tipo
    // Un número
    password += numeros.charAt(Math.floor(Math.random() * numeros.length));
    
    // Una letra mayúscula
    password += mayusculas.charAt(Math.floor(Math.random() * mayusculas.length));
    
    // Una letra minúscula
    password += minusculas.charAt(Math.floor(Math.random() * minusculas.length));
    
    // Un carácter especial
    password += especiales.charAt(Math.floor(Math.random() * especiales.length));
    
    // Todos los caracteres posibles para completar la contraseña
    const todosLosCaracteres = numeros + mayusculas + minusculas + especiales;
    
    // Completamos hasta llegar a 12 caracteres
    while (password.length < 12) {
        password += todosLosCaracteres.charAt(
            Math.floor(Math.random() * todosLosCaracteres.length)
        );
    }
    
    // Convertimos la contraseña en un array y la mezclamos
    return password
        .split('')         // Convierte el string en array de caracteres
        .sort(() => Math.random() - 0.5)  // Mezcla aleatoriamente
        .join('');        // Vuelve a unir los caracteres en un string
};

// Ejemplos de contraseñas generadas:
// console.log(generateTemporaryPassword()); // Ejemplo: "kJ8#mP2$nL9q"
// console.log(generateTemporaryPassword()); // Ejemplo: "P9n$mK5#jL2x"
// console.log(generateTemporaryPassword()); // Ejemplo: "X7b@pN4$hM3y"
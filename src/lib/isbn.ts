export type ResultadoISBN =
  | { estado: 'vacio' }
  | { estado: 'valido'; normalizado: string; tipo: 'isbn10' | 'isbn13'; isbn13: string }
  | { estado: 'invalido'; motivo: string; normalizado: string };

export function limpiarISBN(valor: string): string {
  return (valor || '').replace(/[\s-]/g, '').toUpperCase();
}

function digitoVerificador13(primeros12: string): string {
  let suma = 0;
  for (let i = 0; i < 12; i++) {
    suma += (i % 2 === 0 ? 1 : 3) * Number(primeros12[i]);
  }
  return String((10 - (suma % 10)) % 10);
}

export function isbn13DesdeIsbn10(isbn10: string): string | null {
  const s = limpiarISBN(isbn10);
  if (!/^\d{9}[\dX]$/.test(s)) return null;
  const primeros12 = '978' + s.slice(0, 9);
  return primeros12 + digitoVerificador13(primeros12);
}

export function validarISBN(valor: string): ResultadoISBN {
  const normalizado = limpiarISBN(valor);
  if (!normalizado) return { estado: 'vacio' };

  if (normalizado.length !== 10 && normalizado.length !== 13) {
    return {
      estado: 'invalido',
      motivo: `El ISBN debe tener 10 o 13 dígitos (tiene ${normalizado.length}).`,
      normalizado,
    };
  }

  if (normalizado.length === 10) {
    if (!/^\d{9}[\dX]$/.test(normalizado)) {
      return {
        estado: 'invalido',
        motivo: 'Solo se permiten números (y una X al final en el ISBN-10).',
        normalizado,
      };
    }
    let suma = 0;
    for (let i = 0; i < 10; i++) {
      suma += (10 - i) * (normalizado[i] === 'X' ? 10 : Number(normalizado[i]));
    }
    if (suma % 11 !== 0) {
      return {
        estado: 'invalido',
        motivo: 'El dígito verificador no coincide: revisá los números.',
        normalizado,
      };
    }
    return {
      estado: 'valido',
      normalizado,
      tipo: 'isbn10',
      isbn13: isbn13DesdeIsbn10(normalizado)!,
    };
  }

  if (!/^\d{13}$/.test(normalizado)) {
    return {
      estado: 'invalido',
      motivo: 'Solo se permiten números.',
      normalizado,
    };
  }
  if (!normalizado.startsWith('978') && !normalizado.startsWith('979')) {
    return {
      estado: 'invalido',
      motivo: 'Un ISBN-13 debe empezar con 978 o 979: revisá los números.',
      normalizado,
    };
  }
  let suma = 0;
  for (let i = 0; i < 13; i++) {
    suma += (i % 2 === 1 ? 3 : 1) * Number(normalizado[i]);
  }
  if (suma % 10 !== 0) {
    return {
      estado: 'invalido',
      motivo: 'El dígito verificador no coincide: revisá los números y los guiones.',
      normalizado,
    };
  }
  return { estado: 'valido', normalizado, tipo: 'isbn13', isbn13: normalizado };
}

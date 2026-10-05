import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

const subjectTranslations: Record<string, string> = {
  'fiction': 'Ficción',
  'nonfiction': 'No ficción',
  'classic': 'Clásico',
  'classic literature': 'Literatura clásica',
  'literary': 'Literatura',
  'literature': 'Literatura',
  'science': 'Ciencia',
  'history': 'Historia',
  'biography': 'Biografía',
  'biography & autobiography': 'Biografía y autobiografía',
  'autobiography': 'Autobiografía',
  'philosophy': 'Filosofía',
  'psychology': 'Psicología',
  'social science': 'Ciencias sociales',
  'sociology': 'Sociología',
  'technology': 'Tecnología',
  'engineering': 'Ingeniería',
  'art': 'Arte',
  'music': 'Música',
  'religion': 'Religión',
  'travel': 'Viajes',
  'cooking': 'Cocina',
  'cooking & food': 'Cocina y gastronomía',
  'health': 'Salud',
  'medicine': 'Medicina',
  'education': 'Educación',
  'self-help': 'Autoayuda',
  'business': 'Negocios',
  'economics': 'Economía',
  'law': 'Derecho',
  'political science': 'Ciencias políticas',
  'politics': 'Política',
  'geography': 'Geografía',
  'nature': 'Naturaleza',
  'environment': 'Medio ambiente',
  'reference': 'Referencia',
  'encyclopedia': 'Enciclopedia',
  'dictionary': 'Diccionario',
  'poetry': 'Poesía',
  'drama': 'Teatro',
  'comedy': 'Comedia',
  'horror': 'Terror',
  'mystery': 'Misterio',
  'thriller': 'Suspenso',
  'romance': 'Romance',
  'fantasy': 'Fantasía',
  'science fiction': 'Ciencia ficción',
  'adventure': 'Aventura',
  'western': 'Western',
  'short stories': 'Cuentos',
  'essays': 'Ensayos',
  'juvenile fiction': 'Ficción juvenil',
  'young adult': 'Juvenil',
  'children': 'Infantil',
  "children's literature": 'Literatura infantil',
  'comics & graphic novels': 'Cómics y novelas gráficas',
  'graphic novels': 'Novelas gráficas',
  'mathematics': 'Matemáticas',
  'physics': 'Física',
  'chemistry': 'Química',
  'biology': 'Biología',
  'astronomy': 'Astronomía',
  'computer science': 'Informática',
  'programming': 'Programación',
  'architecture': 'Arquitectura',
  'design': 'Diseño',
  'photography': 'Fotografía',
  'sports': 'Deportes',
  'gardening': 'Jardinería',
  'pets': 'Mascotas',
  'house & home': 'Hogar',
  'family': 'Familia',
  'parenting': 'Crianza',
  'spanish language books': 'Libros en español',
  'spanish language materials': 'Materiales en español',
  'spanish fiction': 'Ficción española',
  'latin american fiction': 'Ficción latinoamericana',
  'latinamerican literature': 'Literatura latinoamericana',
  'colombian fiction': 'Ficción colombiana',
  'magic realism': 'Realismo mágico',
  'magic realism (literature)': 'Realismo mágico (literatura)',
  'social conditions': 'Condiciones sociales',
  'epic literature': 'Literatura épica',
  'epic poems': 'Poemas épicos',
  'large type books': 'Libros de letra grande',
  'cliffs notes': 'Guías de estudio',
  'novel': 'Novela',
  'novels': 'Novelas',
  'fiction (fictional works by one author)': 'Ficción (obras de un autor)',
  'fiction, general': 'Ficción, general',
  'spanish american fiction': 'Ficción hispanoamericana',
  'spanish language': 'Lengua española',
  'criticism and interpretation': 'Crítica e interpretación',
  'translations into arabic': 'Traducciones al árabe',
  'translations into french': 'Traducciones al francés',
  'translations into russian': 'Traducciones al ruso',
  'translations into gujarati': 'Traducciones al guyaratí',
  'in english': 'En inglés',
  'language study': 'Estudio de idiomas',
  'long now manual for civilization': 'Long Now Manual for Civilization',
  'romance literature': 'Literatura romántica',
  'condiciones sociales': 'Condiciones sociales',
  'novela': 'Novela',
  'ficción': 'Ficción',
  'literatura épica': 'Literatura épica',
  'realismo mágico': 'Realismo mágico',
  'literatura latinoamericana': 'Literatura latinoamericana',
  'ficción latinoamericana': 'Ficción latinoamericana',
  'ficción hispanoamericana': 'Ficción hispanoamericana',
  'historias cortas': 'Cuentos',
  'aventura': 'Aventura',
  'literatura infantil': 'Literatura infantil',
  'literatura juvenil': 'Literatura juvenil',
  'materiales en español': 'Materiales en español',
  'libros en español': 'Libros en español',
};

function translateSubjects(subjects: string): string {
  if (!subjects) return subjects;
  const items = subjects.split(',').map(s => s.trim());
  const translated = items.map(s => {
    const lower = s.toLowerCase();
    return subjectTranslations[lower] || s;
  });
  // Eliminar duplicados (caso insensitivo)
  const seen = new Set<string>();
  return translated.filter(s => {
    const key = s.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).join(', ');
}

// Schema Zod compartido para los campos MARC 21 + campos extra
const ejemplarSchema = z.object({
  codigoInterno: z.string().min(1),
  tipoMaterial: z.string().optional(),
  ubicacion: z.string().optional(),
  codigoEstante: z.string().optional(),
});

const libroFieldsSchema = z.object({
  isbn: z.string().optional(),                  // MARC 020
  idioma: z.string().optional(),                // MARC 041
  clasificacion: z.string().optional(),         // MARC 080 - CDU
  autor: z.string().optional(),                 // MARC 100
  autorInstitucional: z.string().optional(),    // MARC 110
  titulo: z.string().optional(),                // MARC 245
  edicion: z.string().optional(),               // MARC 250
  lugarPublicacion: z.string().optional(),      // MARC 260 - Lugar
  editorial: z.string().optional(),             // MARC 260 - Editorial
  anioPublicacion: z.string().optional(),       // MARC 260 - Año
  descripcionFisica: z.string().optional(),     // MARC 300
  notaGeneral: z.string().optional(),           // MARC 500
  temas: z.string().optional(),                 // MARC 650
  descriptores: z.string().optional(),          // MARC 653
  colaboradores: z.string().optional(),         // MARC 700
  bibliotecario: z.string().optional(),         // MARC 900
  volumen: z.string().optional(),                // Número de volumen
  inventario: z.string().optional(),            // Extra - Nº inventario (deprecado)
  tipoMaterial: z.string().optional(),          // Extra (deprecado, usar ejemplares)
  ubicacion: z.string().optional(),             // Extra (deprecado, usar ejemplares)
  portadaUrl: z.string().optional(),            // Portada
  cantidadEjemplares: z.number().default(1),
  datosMarc: z.any().optional(),
  ejemplares: z.array(ejemplarSchema).optional(),
});

export const librosRouter = router({
  getAll: publicProcedure
    .input(z.object({ 
      search: z.string().optional(),
      genero: z.string().optional(),
      page: z.number().optional().default(1),
      pageSize: z.number().optional().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const search = input?.search;
      const genero = input?.genero;
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 10;
      const skip = (page - 1) * pageSize;

      const where: any = {};

      if (search) {
        where.OR = [
          { titulo: { contains: search, mode: 'insensitive' } },
          { autor: { contains: search, mode: 'insensitive' } },
          { autorInstitucional: { contains: search, mode: 'insensitive' } },
          { isbn: { contains: search, mode: 'insensitive' } },
          { temas: { contains: search, mode: 'insensitive' } },
          { editorial: { contains: search, mode: 'insensitive' } },
          { colaboradores: { contains: search, mode: 'insensitive' } },
          { ejemplares: { some: { codigoInterno: { contains: search, mode: 'insensitive' } } } },
        ];
      }

      if (genero && genero !== '') {
        where.clasificacion = {
          startsWith: genero,
        };
      }

      const [libros, total] = await Promise.all([
        ctx.prisma.libro.findMany({
          where,
          include: {
            _count: {
              select: {
                ejemplares: true,
                prestamos: { where: { estado: 'PRESTADO' } },
              },
            },
          },
          skip,
          take: pageSize,
          orderBy: { titulo: 'asc' },
        }),
        ctx.prisma.libro.count({ where }),
      ]);

      return {
        libros: libros.map(l => ({
          ...l,
          cantidadEjemplares: l._count.ejemplares || l.cantidadEjemplares,
          ejemplaresDisponibles: (l._count.ejemplares || l.cantidadEjemplares) - l._count.prestamos,
        })),
        total,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.libro.findUnique({
        where: { id: input.id },
        include: { ejemplares: true },
      });
    }),

  create: publicProcedure
    .input(libroFieldsSchema)
    .mutation(async ({ ctx, input }) => {
      const { ejemplares, ...libroData } = input;
      const data: any = {};
      for (const [key, value] of Object.entries(libroData)) {
        if (value !== undefined && value !== null && value !== '') {
          data[key] = value;
        }
      }
      data.cantidadEjemplares = ejemplares?.length || 1;
      if (ejemplares && ejemplares.length > 0) {
        data.ejemplares = {
          createMany: { data: ejemplares.map(e => ({ codigoInterno: e.codigoInterno, tipoMaterial: e.tipoMaterial || null, ubicacion: e.ubicacion || null, codigoEstante: e.codigoEstante || null })) },
        };
      }
      return await ctx.prisma.libro.create({ data });
    }),

  update: publicProcedure
    .input(libroFieldsSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ejemplares, ...data } = input;
      return await ctx.prisma.libro.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.libro.delete({
        where: { id: input.id },
      });
    }),

  deleteEjemplares: publicProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.ejemplar.deleteMany({
        where: { id: { in: input.ids } },
      });
    }),

  addEjemplares: publicProcedure
    .input(z.object({
      libroId: z.string(),
      ejemplares: z.array(z.object({
        codigoInterno: z.string().min(1),
        tipoMaterial: z.string().optional(),
        ubicacion: z.string().optional(),
        codigoEstante: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const libro = await ctx.prisma.libro.findUnique({ where: { id: input.libroId }, select: { id: true } });
      if (!libro) throw new Error('Libro no encontrado');
      await ctx.prisma.ejemplar.createMany({
        data: input.ejemplares.map(e => ({
          libroId: input.libroId,
          codigoInterno: e.codigoInterno,
          tipoMaterial: e.tipoMaterial || null,
          ubicacion: e.ubicacion || null,
          codigoEstante: e.codigoEstante || null,
        })),
      });
      const count = await ctx.prisma.ejemplar.count({ where: { libroId: input.libroId } });
      await ctx.prisma.libro.update({
        where: { id: input.libroId },
        data: { cantidadEjemplares: count },
      });
      return true;
    }),

  buscar: publicProcedure
    .input(z.object({ q: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const q = input.q.trim();
      return await ctx.prisma.libro.findMany({
        where: {
          OR: [
            { isbn: { startsWith: q } },
            { titulo: { contains: q, mode: 'insensitive' } },
            { autor: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { titulo: 'asc' },
      });
    }),

  searchExternalByTitle: publicProcedure
    .input(z.object({ 
      titulo: z.string().min(1),
      autor: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const buildQuery = () => {
        let q = `intitle:${input.titulo}`;
        if (input.autor) q += `+inauthor:${input.autor}`;
        return q;
      };

      let found = false;
      // 1. Google Books API
      try {
        const query = buildQuery().replace(/ /g, '+');
        const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10&projection=full&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            found = true;
            return data.items.map((item: any) => {
              const info = item.volumeInfo;
              const isbn = info.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13' || i.type === 'ISBN_10')?.identifier || '';
              return {
                id: item.id,
                titulo: info.title + (info.subtitle ? `: ${info.subtitle}` : ''),
                autor: info.authors?.[0] || '',
                anioPublicacion: info.publishedDate?.split('-')[0] || '',
                editorial: info.publisher || '',
                isbn,
                portadaUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
                idioma: info.language || '',
              };
            });
          }
        }
      } catch (error: any) {
        console.error('Error al consultar Google Books API:', error?.message || error);
      }

      // 2. Fallback a Open Library Search
      if (!found) {
        const query = input.autor ? `${input.titulo} ${input.autor}` : input.titulo;
        try {
          console.log(`Fallback a Open Library Search para: ${query}`);
          const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
          if (response.ok) {
            const data = await response.json();
            return (data.docs || []).map((doc: any) => ({
              id: doc.key,
              titulo: doc.title,
              autor: doc.author_name?.[0] || '',
              anioPublicacion: doc.first_publish_year?.toString() || '',
              editorial: doc.publisher?.[0] || '',
              isbn: doc.isbn?.[0] || '',
              portadaUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
              idioma: doc.language?.[0] || '',
            }));
          }
        } catch (error: any) {
          console.error('Error al consultar Open Library Search:', error?.message || error);
        }
      }

      return [];
    }),

  getByExternalId: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      if (input.id.startsWith('/works/')) {
        try {
          const editionsUrl = `https://openlibrary.org${input.id}/editions.json?limit=1`;
          const editionRes = await fetch(editionsUrl);
          if (editionRes.ok) {
            const editionData = await editionRes.json();
            const edition = editionData.entries?.[0];
            if (edition) {
              const isbn = edition.isbn_13?.[0] || edition.isbn_10?.[0] || '';
              return {
                isbn,
                titulo: edition.title || '',
                autor: (edition.authors || []).map((a: any) => a.name).join(', '),
                colaboradores: '',
                anioPublicacion: edition.publish_date?.match(/\d{4}/)?.[0] || '',
                editorial: (edition.publishers || []).join(', '),
                lugarPublicacion: (edition.publish_places || []).join(', '),
                edicion: '',
                portadaUrl: edition.cover?.large || edition.cover?.medium || edition.cover?.small || '',
                descripcionFisica: edition.number_of_pages ? `${edition.number_of_pages} p.` : '',
                idioma: edition.languages?.[0]?.key?.replace('/languages/', '') || '',
                temas: translateSubjects((edition.subjects || []).join(', ')),
              };
            }
          }
        } catch (error: any) {
          console.error('Error al consultar OpenLibrary editions:', error?.message || error);
        }
        return null;
      }
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${input.id}?key=${process.env.GOOGLE_BOOKS_API_KEY}`);
        if (response.ok) {
          const data = await response.json();
          const info = data.volumeInfo;
          const isbn = info.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13' || i.type === 'ISBN_10')?.identifier || '';
          return {
            isbn,
            titulo: info.title + (info.subtitle ? `: ${info.subtitle}` : ''),
            autor: info.authors?.[0] || '',
            colaboradores: info.authors?.slice(1).join(', ') || '',
            anioPublicacion: info.publishedDate?.split('-')[0] || '',
            editorial: info.publisher || '',
            lugarPublicacion: '',
            edicion: '',
            portadaUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
            descripcionFisica: info.pageCount ? `${info.pageCount} p.` : '',
            idioma: info.language || '',
            temas: translateSubjects(info.categories?.join(', ') || ''),
          };
        }
      } catch (error: any) {
        console.error('Error al consultar Google Books API por ID:', error?.message || error);
      }
      return null;
    }),

  getByIsbnExternal: publicProcedure
    .input(z.object({ isbn: z.string() }))
    .mutation(async ({ input }) => {
      const cleanIsbn = input.isbn.replace(/[-\s]/g, '');
      let titulo = '';
      let autor = '';
      let anioPublicacion = '';
      let editorial = '';
      let lugarPublicacion = '';
      let edicion = '';
      let portadaUrl = '';
      let descripcionFisica = '';
      let idioma = '';
      let temas = '';
      let colaboradores = '';
      let found = false;

      // 1. Intentar con Google Books API
      try {
        console.log(`Intentando buscar ISBN ${cleanIsbn} en Google Books...`);
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}&key=${process.env.GOOGLE_BOOKS_API_KEY}`);
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const info = data.items[0].volumeInfo;
            titulo = info.title || '';
            autor = info.authors?.[0] || '';
            colaboradores = info.authors?.slice(1).join(', ') || '';
            anioPublicacion = info.publishedDate?.split('-')[0] || '';
            editorial = info.publisher || '';
            idioma = info.language || '';
            temas = translateSubjects(info.categories?.join(', ') || '');
            portadaUrl = info.imageLinks?.thumbnail?.replace('http:', 'https:') || '';
            descripcionFisica = info.pageCount ? `${info.pageCount} p.` : '';
            found = true;
          }
        } else {
          console.warn(`Google Books API devolvió status ${response.status}`);
        }
      } catch (error: any) {
        console.error('Error al consultar Google Books API:', error?.message || error);
      }

      // 2. Intentar con Open Library API como fallback
      if (!found) {
        try {
          console.log(`Intentando buscar ISBN ${cleanIsbn} en Open Library...`);
          const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
          if (response.ok) {
            const data = await response.json();
            const bookKey = `ISBN:${cleanIsbn}`;
            if (data[bookKey]) {
              const info = data[bookKey];
              titulo = info.title + (info.subtitle ? `: ${info.subtitle}` : '');
              const authors = info.authors?.map((a: any) => a.name) || [];
              autor = authors[0] || '';
              colaboradores = authors.slice(1).join(', ') || '';
              anioPublicacion = info.publish_date?.match(/\d{4}/)?.[0] || '';
              editorial = info.publishers?.map((p: any) => p.name).join(', ') || '';
              lugarPublicacion = info.publish_places?.map((p: any) => p.name).join(', ') || '';
              temas = translateSubjects(info.subjects?.map((s: any) => s.name).join(', ') || '');
              portadaUrl = info.cover?.large || info.cover?.medium || info.cover?.small || '';
              descripcionFisica = info.number_of_pages ? `${info.number_of_pages} p.` : '';
              found = true;
            }
          } else {
            console.warn(`Open Library API devolvió status ${response.status}`);
          }
        } catch (error: any) {
          console.error('Error al consultar Open Library API:', error?.message || error);
        }
      }

      // 3. Intentar con WorldCat Classify API como tercer fallback (sin API key)
      if (!found) {
        try {
          console.log(`Intentando buscar ISBN ${cleanIsbn} en WorldCat Classify...`);
          const response = await fetch(`http://classify.oclc.org/classify2/classify?isbn=${cleanIsbn}&format=json`);
          if (response.ok) {
            const data = await response.json();
            const work = data.works?.[0]?.work;
            const edition = data.editions?.edition;
            if (work || edition) {
              titulo = work?.title || edition?.title || '';
              autor = work?.author || '';
              editorial = edition?.publisher || '';
              anioPublicacion = edition?.publishDate?.match(/\d{4}/)?.[0] || '';
              idioma = edition?.language || '';
              found = true;
            }
          } else {
            console.warn(`WorldCat Classify devolvió status ${response.status}`);
          }
        } catch (error: any) {
          console.error('Error al consultar WorldCat Classify:', error?.message || error);
        }
      }

      // 4. Fallback inteligente para la portada: si encontramos el libro pero no tiene portadaUrl,
      // verificamos directamente si existe en Open Library Covers usando un request HEAD rápido.
      if (found && !portadaUrl) {
        try {
          console.log(`Buscando portada directamente por ISBN ${cleanIsbn} en Open Library Covers...`);
          const coverCheckUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg?default=false`;
          const checkRes = await fetch(coverCheckUrl, { method: 'HEAD' });
          if (checkRes.ok) {
            portadaUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
            console.log(`Portada encontrada directamente: ${portadaUrl}`);
          } else {
            console.log('No se encontró portada directa en Open Library Covers.');
          }
        } catch (error: any) {
          console.error('Error al verificar portada directa en Open Library:', error?.message || error);
        }
      }

      if (found) {
        return {
          titulo,
          autor,
          colaboradores,
          anioPublicacion,
          editorial,
          lugarPublicacion,
          edicion,
          portadaUrl,
          descripcionFisica,
          idioma,
          temas,
        };
      }

      return null;
    }),
});

/**
 * Helpers para consumir o contrato padronizado da API.
 * Formato: { success, data?, message?, pagination?, errors? }
 */

export function parseApiResponse(payload) {
  if (payload == null) {
    return { data: null, pagination: undefined, message: undefined };
  }

  if (typeof payload === 'object' && payload.success === false) {
    const err = new Error(payload.message || 'Erro na API');
    err.errors = payload.errors;
    err.response = { data: payload };
    throw err;
  }

  if (typeof payload === 'object' && payload.success === true) {
    return {
      data: payload.data,
      pagination: payload.pagination,
      message: payload.message,
    };
  }

  return { data: payload };
}

export function unwrapData(payload) {
  return parseApiResponse(payload).data;
}

export function unwrapList(payload) {
  const parsed = parseApiResponse(payload);
  const data = parsed.data;
  return Array.isArray(data) ? data : [];
}

export function unwrapPaginated(payload) {
  const parsed = parseApiResponse(payload);
  return {
    data: Array.isArray(parsed.data) ? parsed.data : [],
    pagination: parsed.pagination || { page: 1, limit: 15, total: 0, totalPages: 0 },
  };
}

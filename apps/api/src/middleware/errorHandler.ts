import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly type: string;

  constructor(message: string, status = 400, code = 'APP_ERROR', type = 'https://nexa.api/errors/general') {
    super(message);
    this.status = status;
    this.code = code;
    this.type = type;
  }
}

export function errorHandler(error: FastifyError | ZodError | AppError | Error, request: FastifyRequest, reply: FastifyReply) {
  const requestId = request.id || `req_${Math.random().toString(36).substring(2, 9)}`;

  if (error instanceof ZodError) {
    const detail = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    return reply.status(422).send({
      type: 'https://nexa.api/errors/validation',
      title: 'Erro de Validação',
      status: 422,
      detail,
      instance: request.url,
      code: 'VALIDATION_FAILED',
      requestId,
      issues: error.errors,
    });
  }

  if (error instanceof AppError) {
    return reply.status(error.status).send({
      type: error.type,
      title: error.name || 'Erro da Aplicação',
      status: error.status,
      detail: error.message,
      instance: request.url,
      code: error.code,
      requestId,
    });
  }

  // Fastify errors (ex: 404, rate limit)
  const statusCode = (error as FastifyError).statusCode || 500;
  request.log.error({ err: error, requestId }, 'Unhandled request error');

  return reply.status(statusCode).send({
    type: 'https://nexa.api/errors/internal',
    title: statusCode === 500 ? 'Erro Interno do Servidor' : error.message,
    status: statusCode,
    detail: statusCode === 500 ? 'Ocorreu um erro inesperado ao processar a requisição.' : error.message,
    instance: request.url,
    code: (error as FastifyError).code || 'INTERNAL_ERROR',
    requestId,
  });
}

import { Response } from 'express';

export const sendResponse = {
  ok: (res: Response, data: unknown): void => {
    res.json(data);
  },

  created: (res: Response, data: unknown): void => {
    res.status(201).json(data);
  },

  noContent: (res: Response): void => {
    res.status(204).send();
  },

  badRequest: (res: Response, message = 'Bad Request'): void => {
    res.status(400).json({ error: message });
  },

  unauthorized: (res: Response, message = 'Unauthorized'): void => {
    res.status(401).json({ error: message });
  },

  forbidden: (res: Response, message = 'Forbidden'): void => {
    res.status(403).json({ error: message });
  },

  notFound: (res: Response, message = 'Not Found'): void => {
    res.status(404).json({ error: message });
  },

  error: (res: Response, error: unknown): void => {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}; 
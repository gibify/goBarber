import { Router } from 'express';

import AuthenticationUserService from '../services/AuthenticationUserService';

const sessionsRouter = Router();

sessionsRouter.post('/', async (request, response) => {
   try {
    const { email, password } = request.body;

    const authenticationUser = new AuthenticationUserService();

    await authenticationUser.execute({
        email,
        password,
    });

    return response.json({ ok: true});
    } catch (err) {
        return response.status(400).json({ error: err.message });
    };
});

export default sessionsRouter;
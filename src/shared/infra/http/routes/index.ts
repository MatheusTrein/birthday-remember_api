import { Router } from "express";

import { sessionsRouter } from "@modules/accounts/infra/http/routes/sessions.routes";
import { usersRouter } from "@modules/accounts/infra/http/routes/users.routes";
import { birthdayPersonsRouter } from "@modules/birthdayPersons/infra/http/routes/birthdayPersons.routes";
import { passwordRouter } from "@modules/accounts/infra/http/routes/password.routes";

const router = Router();

router.use("/users", usersRouter);
router.use("/password", passwordRouter);
router.use("/sessions", sessionsRouter);
router.use("/birthday-persons", birthdayPersonsRouter);

export { router };

import * as yup from 'yup';
import { Departments } from '@/lib/game/game';

const gameValidator = yup.object().shape({
  totalDays: yup.number().min(5).max(120).default(30),
  dayDurationSeconds: yup.number().min(30).max(120).default(60),
  enabledDepartments: yup.array(yup.mixed<Departments>().oneOf(['retail', 'wholesale']).required()).ensure().default(['retail', 'wholesale']),
  difficulty: yup.number().min(0).max(2).default(0),
  startingBalance: yup.number().min(50_000).max(2_000_000).default(100_000),
});

export default gameValidator;
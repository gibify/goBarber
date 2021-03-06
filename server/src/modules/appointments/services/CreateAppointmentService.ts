import { startOfHour, isBefore, getHours, format } from 'date-fns';
import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Appointment from "../infra/typeorm/entities/Appointment";
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';
import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';

interface IRequest {
    provider_id: string;
    user_id: string;
    date: Date;
};

@injectable()
class CreateAppointmentService {
    constructor(
        @inject('AppointmentsRepository')
        private appointmentsRepository: IAppointmentsRepository,

        @inject('NotificationsRepository')
        private notificatiosRepository: INotificationsRepository,
    ) {}

    public async execute({
        date,
        provider_id,
        user_id
    }: IRequest): Promise<Appointment> {
        const appointmentDate = startOfHour(date);

        if(isBefore(appointmentDate, Date.now())) {
            throw new AppError('You can not create an appointment on a past date');
        }

        if(user_id === provider_id) {
            throw new AppError('You can not create an apointment with yourself');
        }

        if(getHours(appointmentDate) < 8 || getHours(appointmentDate) > 17) {
            throw new AppError('You can only create appointments between 8AM and 5PM');
        }

        const findAppointmentInSamedate = await this.appointmentsRepository.findByDate(
            appointmentDate,
        );

        if(findAppointmentInSamedate) {
            throw new AppError('This appointment is alread booked');
        }

        const appointment = await this.appointmentsRepository.create({
            provider_id,
            user_id,
            date: appointmentDate,
        });


        const dateFormatted = format(appointmentDate, "dd/MM/yyyy 'às' HH:mm");

        await this.notificatiosRepository.create({
            recipient_id: provider_id,
            content: `Novo agendamento para o dia ${dateFormatted}`
        });


        return appointment;
    }
};

export default CreateAppointmentService;

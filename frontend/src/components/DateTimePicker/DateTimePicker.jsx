import {
    Box
} from "@mui/material";
import dayjs from "dayjs";
import { React, useState, useEffect } from "react";

import { CustomScheduleSelector } from './CustomScheduleSelector';
import { PrevNextWeek } from './PrevNextWeek';
import { GetMonday } from '../GetMonday/GetMonday';

/**
 * A Google Calendar and When2meet style date and time picker
 * @param {function} handleScheduleDate a function that takes a list of dates, and will validate them
 * @param {Date[]} scheduleDates a list of dates that are currently selected
 * @param {function} setScheduleDates a react hook that is a function that takes a list of dates, and will set the scheduleDates state
 * @returns
 */
export const DateTimePicker = ({ handleScheduleDate, scheduleDates, setScheduleDates }) => {
    const [calendarDate, setDate] = useState(dayjs(new Date()));
    const [blockedDates, setBlockedDates] = useState([]);

    /**
     * sets BlockedDates to the dates that are blocked for the week of startDate.
     * by blocked, we mean that there is already a request (pending or approved)
     * for that date.
     *
     * @param {date} startDate the start date of the week to get blocked dates for
     */
    const handleBlockedDates = async (startDate) => {
        // the end date is 5 days after the start date
        const startMonday = GetMonday(startDate);
        const endDate = dayjs(startMonday).add(5, "day").toDate();

        await fetch(process.env.REACT_APP_API_URL + "/requests/getBlockedDates/" + startMonday.toISOString() + "/" + endDate.toISOString())
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                // convert dates into date objects
                let blocked = [];
                data.forEach((date) => {
                    blocked.push(new Date(date));
                }
                );
                setBlockedDates(blocked);
            });
    };

    useEffect(() => {
        handleBlockedDates(calendarDate);
    }, [calendarDate]);

    return (
        <>
            <PrevNextWeek
                calendarDate={calendarDate}
                setDate={setDate}
                setScheduleDates={setScheduleDates}
                handleBlockedDates={handleBlockedDates}
            />
            <Box
                onMouseDown={() => {
                    setScheduleDates([]);
                }}

                sx={{
                    marginBottom: "1em",
                    width: "100%",
                }}
            >
                <CustomScheduleSelector
                    scheduleDates={scheduleDates}
                    handleScheduleDate={handleScheduleDate}
                    calendarDate={calendarDate}
                    blockedDates={blockedDates}
                />
            </Box>
        </>
    );
}

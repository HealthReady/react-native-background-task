// @flow

import {AppRegistry, NativeModules} from 'react-native'
import type {BackgroundTaskInterface} from './types'

const {AppState, BackgroundJob: RNBackgroundJob} = NativeModules
const JOB_KEY = 'backgroundTask'

const BackgroundTask: BackgroundTaskInterface = {

    register: function (task, {
        period = 900, // 15 minutes
        timeout = 30,
    } = {}) {
        // Cancel any existing tasks, as we can only have one to match iOS, and we
        // have no way to tell whether the function has changed or not.
        RNBackgroundJob.cancelAll()

        // Register the headless task
        const fn = async () => {
            task()
        }
        AppRegistry.registerHeadlessTask(JOB_KEY, () => fn)

        // Schedule it to run as a periodic task
        AppState.getCurrentAppState(
            ({appState}) => {
                RNBackgroundJob.schedule(
                    JOB_KEY,
                    timeout * 1000, // convert to ms
                    period * 1000, // convert to ms
                    true, // persist after restart
                    RNBackgroundJob.ANY, // network type
                    false, // requires charging
                    false, // requires device idle
                    false, // always running
                    undefined,  // notification title
                    undefined,  // notification icon
                    undefined,  // notification message
                )
            },
            () => {
                console.error(`Can't get AppState`)
            }
        )
    },

    cancel: function () {
        RNBackgroundJob.cancelAll()
    },

    finish: function () {
        // Needed for iOS, no-op on Android
    },
}

module.exports = BackgroundTask
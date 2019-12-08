export default {
  //  Usage: Runs before request has entered it's route
  startLog: {
    //  Accepts array of strings
    req: [
      // 'req.body',
      // 'req.headers',
      // 'req.method',
      // 'req.params',
      // 'req.protocol',
      // 'req.query',
      // 'req.url',
    ],
    //  Accepts string
    // user: 'req.user',
    /*  Accepts object with string
      user: {
        user_id: 'req.user.sub'
      }
      */
    /*  Accepts object array of strings
      user: {
        foo: ['req.user.bar','req.user.bar1', 'req.user.bar2']
      }
      */
  },
  //  Usage: req.log.info('log msg') or req.log.[level]('log msg')..
  middlewareLog: {
    req: [
      // 'req.body',
      // 'req.headers',
      // 'req.method',
      // 'req.params',
      // 'req.protocol',
      // 'req.query',
      // 'req.url',
    ],
    // user: 'req.user',
  },
  //  Usage: Runs on response errored
  errorLog: {
    err: 'err',
    req: [
      'req.body',
      'req.headers',
      'req.method',
      'req.params',
      'req.protocol',
      'req.query',
      'req.url',
    ],
    res: [
      'res._headers',
      'res.shouldKeepAlive',
      'res.statusCode',
      'res.statusMessage',
    ],
    // user: 'req.user',
  },
  //  Usage: Runs after request.end() has been called
  finishedLog: {
    res: [
      // 'res._headers',
      // 'res.shouldKeepAlive',
      // 'res.statusCode',
      'res.statusMessage',
    ],
    // user: 'req.user',
  },
};

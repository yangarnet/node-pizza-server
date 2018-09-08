const setting = require('./setting.json');

const config = () => {
    const currentEnv = process.env.NODE_ENV || 'development';
    // set the env config
    setting[currentEnv] && Object.keys(setting[currentEnv]).forEach(key => {
        process.env[key] = setting[currentEnv][key];
    });
};

module.exports= config;
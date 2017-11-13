import path from "path";

let config = {
    mock_dir_path: __dirname,
    response_dir_path: path.join(__dirname, 'responses')
};

module.exports.config = config;
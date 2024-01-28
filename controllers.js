const { User, Exercise } = require("./schema");

exports.createUser = async (req, res) => {
  try {
    const newUser = new User({ username: req.body.username });
    await newUser.save();
    res.json({ username: newUser.username, _id: newUser._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(
      users.map((user) => ({
        username: user.username,
        _id: user._id.toString(),
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addExercise = async (req, res) => {
    try {
        const { description, duration, date } = req.body;
        const userId = req.params._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let exerciseDate;
        if (date) {
            const dateParts = date.split('-').map(part => parseInt(part));
            dateParts[1] -= 1; 
            exerciseDate = new Date(Date.UTC(dateParts[0], dateParts[1], dateParts[2]));
        } else {
            exerciseDate = new Date();
        }

        const exercise = new Exercise({
            userId,
            description,
            duration,
            date: exerciseDate
        });
        await exercise.save();

        const formatUTCDate = (date) => {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            const day = days[date.getUTCDay()];
            const month = months[date.getUTCMonth()];
            const dateNum = date.getUTCDate();
            const year = date.getUTCFullYear();

            return `${day} ${month} ${String(dateNum).padStart(2, '0')} ${year}`;
        };

        res.json({
            _id: user._id.toString(),
            username: user.username,
            date: formatUTCDate(exerciseDate),
            duration: exercise.duration,
            description: exercise.description
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getUserLogs = async (req, res) => {
  try {
    const userId = req.params._id;
    const { from, to, limit } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let query = Exercise.find({ userId }).sort("date");
    if (from) {
      query = query.where("date").gte(new Date(from));
    }
    if (to) {
      query = query.where("date").lte(new Date(to));
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const exercises = await query.exec();
    const log = exercises.map((ex) => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date.toDateString(),
    }));

    res.json({
      _id: user._id.toString(),
      username: user.username,
      count: exercises.length,
      log,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

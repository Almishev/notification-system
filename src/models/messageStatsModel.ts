import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
    count: {
        type: Number,
        default: 0
    }
});

const Stats = mongoose.models.stats || mongoose.model('stats', statsSchema);

export default Stats;
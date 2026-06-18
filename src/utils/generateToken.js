const addTagnamesToTheManager = async (req, res, next) => {
  const { id } = req.params;
  const { topics } = req.body;

  if (!Array.isArray(topics) || topics.length === 0) {
    return res.status(400).json({ error: "Topics must be a non-empty array." });
  }

  try {
    const updatedEmployee = await Manager.findByIdAndUpdate(
      id,
      { $addToSet: { topics: { $each: topics } } },
      { new: true },
    );

    if (!updatedEmployee) {
      return res.status(404).json({ error: "Manager not found." });
    }

    return res.status(200).json({
      message: "Topics updated successfully.",
      Manager: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating topics:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating topics." });
  }
};

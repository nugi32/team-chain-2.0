

/**
 * Ownership Middleware Factory
 *
 * Creates a middleware that verifies the authenticated user owns the resource
 * before allowing modifications (PUT/DELETE)
 *
 * Usage:
 * router.put(
 *   "/:id",
 *   authMiddleware,
 *   ownershipMiddleware(req => db.collection("tasks").findOne({_id: new ObjectId(req.params.id)})),
 *   updateController
 * )
 *
 * @param resourceGetter Async function that retrieves the resource from DB
 * @returns Middleware function
 */
export function ownershipMiddleware(
  resourceGetter
) {
  return async (
    req,
    res,
    next
  ) => {
      try {
        // ✅ CRITICAL: User must be authenticated first
        if (!req.user || !req.user.address) {
          res.status(401).json({
            error: "Unauthorized - authentication required",
          })
          return
        }

        // Fetch the resource from database
        const resource = await resourceGetter(req)

        if (!resource) {
          res.status(404).json({
            error: "Resource not found",
          })
          return
        }

        // ✅ CRITICAL: Verify owner exists in resource
        if (!resource.owner) {
          res.status(500).json({
            error: "Resource missing owner field",
          })
          return
        }

        // ✅ CRITICAL: Compare addresses (case-insensitive)
        const userAddress = req.user.address.toLowerCase()
        const resourceOwner = resource.owner.toLowerCase()

        if (userAddress !== resourceOwner) {
          res.status(403).json({
            error: "Forbidden - you are not the owner of this resource",
          })
          return
        }

        // ✅ Attach resource to request for controller access (optional)
        req.resource = resource

        next()
      } catch (error) {
        console.error("Ownership verification error:", error)
        res.status(500).json({ error: "Ownership verification failed" })
      }
    }
}
